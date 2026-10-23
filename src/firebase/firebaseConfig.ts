import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

function requireConfigValue(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`Missing Firebase frontend configuration: ${name}`);
  }
  return value;
}

export function getFirebaseAuth(): Auth {
  const firebaseConfig = {
    apiKey: requireConfigValue(
      "VITE_FIREBASE_API_KEY",
      import.meta.env.VITE_FIREBASE_API_KEY
    ),
    authDomain: requireConfigValue(
      "VITE_FIREBASE_AUTH_DOMAIN",
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    ),
    projectId: requireConfigValue(
      "VITE_FIREBASE_PROJECT_ID",
      import.meta.env.VITE_FIREBASE_PROJECT_ID
    ),
    appId: requireConfigValue(
      "VITE_FIREBASE_APP_ID",
      import.meta.env.VITE_FIREBASE_APP_ID
    ),
    messagingSenderId: requireConfigValue(
      "VITE_FIREBASE_MESSAGING_SENDER_ID",
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ),
  };

  if (firebaseConfig.projectId !== "abvolt-backend") {
    throw new Error(
      "VITE_FIREBASE_PROJECT_ID must match the configured backend project"
    );
  }

  const existingApp = getApps().find((app) => app.name === "[DEFAULT]");
  const app = existingApp ?? initializeApp(firebaseConfig);

  if (
    app.options.apiKey !== firebaseConfig.apiKey ||
    app.options.authDomain !== firebaseConfig.authDomain ||
    app.options.projectId !== firebaseConfig.projectId ||
    app.options.appId !== firebaseConfig.appId ||
    app.options.messagingSenderId !== firebaseConfig.messagingSenderId
  ) {
    throw new Error(
      "The initialized Firebase app does not match the frontend configuration"
    );
  }

  return getAuth(app);
}
