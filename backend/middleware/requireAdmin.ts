import { createPrivateKey } from "crypto";
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { NextFunction, Request, Response } from "express";

type ServiceAccount = {
  type: "service_account";
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  token_uri: string;
};

type AdminAuthConfig = {
  auth: Auth;
  projectId: string;
  adminUids: Set<string>;
};

type ConfigFailureCode =
  | "project_id_missing"
  | "project_id_invalid"
  | "service_account_missing"
  | "service_account_json_invalid"
  | "service_account_fields_invalid"
  | "service_account_project_mismatch"
  | "service_account_private_key_invalid"
  | "admin_uids_missing"
  | "admin_uids_invalid"
  | "firebase_admin_app_unverifiable"
  | "firebase_admin_app_initialization_failed"
  | "firebase_admin_app_project_mismatch"
  | "firebase_admin_auth_initialization_failed";

class FirebaseConfigError extends Error {
  constructor(readonly code: ConfigFailureCode) {
    super(code);
  }
}

let initializedApp: App | undefined;
let initializedProjectId: string | undefined;
let initializedClientEmail: string | undefined;
let initializedPrivateKey: string | undefined;

function isServiceAccount(value: unknown): value is ServiceAccount {
  if (typeof value !== "object" || value === null) return false;

  const account = value as Record<string, unknown>;
  return (
    account.type === "service_account" &&
    isNonEmptyString(account.project_id) &&
    isNonEmptyString(account.private_key_id) &&
    isNonEmptyString(account.private_key) &&
    typeof account.client_email === "string" &&
    /^\S+@\S+$/.test(account.client_email) &&
    typeof account.client_id === "string" &&
    /^\d+$/.test(account.client_id) &&
    account.token_uri === "https://oauth2.googleapis.com/token"
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getAdminAuthConfig(): AdminAuthConfig {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) throw new FirebaseConfigError("project_id_missing");
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
    throw new FirebaseConfigError("project_id_invalid");
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new FirebaseConfigError("service_account_missing");
  }

  let parsedServiceAccount: unknown;
  try {
    parsedServiceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new FirebaseConfigError("service_account_json_invalid");
  }

  if (!isServiceAccount(parsedServiceAccount)) {
    throw new FirebaseConfigError("service_account_fields_invalid");
  }

  if (parsedServiceAccount.project_id !== projectId) {
    throw new FirebaseConfigError("service_account_project_mismatch");
  }

  const privateKey = parsedServiceAccount.private_key.replace(/\\n/g, "\n");
  try {
    const key = createPrivateKey(privateKey);
    if (key.asymmetricKeyType !== "rsa") {
      throw new Error();
    }
  } catch {
    throw new FirebaseConfigError("service_account_private_key_invalid");
  }

  const configuredUids = process.env.ADMIN_UIDS;
  if (!configuredUids) {
    throw new FirebaseConfigError("admin_uids_missing");
  }

  const adminUids = configuredUids.split(",").map((uid) => uid.trim());
  if (
    adminUids.length === 0 ||
    adminUids.some(
      (uid) => uid.length === 0 || uid.length > 128 || /\s/.test(uid)
    )
  ) {
    throw new FirebaseConfigError("admin_uids_invalid");
  }

  const appName = "abvolt-api";
  const existingApp = getApps().find((app) => app.name === appName);
  let app: App;

  if (existingApp) {
    if (
      existingApp !== initializedApp ||
      initializedProjectId !== projectId ||
      initializedClientEmail !== parsedServiceAccount.client_email ||
      initializedPrivateKey !== privateKey ||
      existingApp.options.projectId !== projectId
    ) {
      throw new FirebaseConfigError("firebase_admin_app_unverifiable");
    }

    app = existingApp;
  } else {
    if (initializedApp) {
      throw new FirebaseConfigError("firebase_admin_app_unverifiable");
    }

    try {
      app = initializeApp(
        {
          projectId,
          credential: cert({
            projectId: parsedServiceAccount.project_id,
            clientEmail: parsedServiceAccount.client_email,
            privateKey,
          }),
        },
        appName
      );
    } catch {
      throw new FirebaseConfigError(
        "firebase_admin_app_initialization_failed"
      );
    }

    initializedApp = app;
    initializedProjectId = projectId;
    initializedClientEmail = parsedServiceAccount.client_email;
    initializedPrivateKey = privateKey;
  }

  if (app.options.projectId !== projectId) {
    throw new FirebaseConfigError("firebase_admin_app_project_mismatch");
  }

  let auth: Auth;
  try {
    auth = getAuth(app);
  } catch {
    throw new FirebaseConfigError("firebase_admin_auth_initialization_failed");
  }

  return {
    auth,
    projectId,
    adminUids: new Set(adminUids),
  };
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.get("authorization");
    const match = authorization?.match(/^Bearer ([^\s]+)$/i);

    if (!match) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let config: AdminAuthConfig;
    try {
      config = getAdminAuthConfig();
    } catch (error) {
      const code =
        error instanceof FirebaseConfigError
          ? error.code
          : "firebase_admin_app_initialization_failed";
      console.error("Firebase Admin authentication configuration failed:", code);
      return res
        .status(503)
        .json({ error: "Authentication service unavailable" });
    }

    let decodedToken;
    try {
      decodedToken = await config.auth.verifyIdToken(match[1], true);
    } catch {
      return res.status(401).json({ error: "Invalid or expired credentials" });
    }

    if (
      decodedToken.aud !== config.projectId ||
      decodedToken.iss !==
        `https://securetoken.google.com/${config.projectId}`
    ) {
      return res.status(401).json({ error: "Invalid or expired credentials" });
    }

    if (!config.adminUids.has(decodedToken.uid)) {
      return res.status(403).json({ error: "Administrator access required" });
    }
  } catch {
    console.error("Firebase Admin authentication failed.");
    return res
      .status(503)
      .json({ error: "Authentication service unavailable" });
  }

  return next();
}
