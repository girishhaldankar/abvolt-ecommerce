import { getFirebaseAuth } from "../firebase/firebaseConfig";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiFetch = async (
  url: string,
  options?: RequestInit
) => {
  const method = (options?.method || "GET").toUpperCase();
  const headers = new Headers({ "Content-Type": "application/json" });

  new Headers(options?.headers).forEach((value, key) => {
    headers.set(key, value);
  });

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      throw new Error("Sign in with an administrator account to make changes.");
    }

    headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new ApiError(err?.error || "API Error", res.status, err);
  }

  return res.json();
};
