import { FormEvent, useState } from "react";
import { FirebaseError } from "firebase/app";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AbvoltLogo from "../../components/AbvoltLogo";

function getSignInErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "The email or password is incorrect.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact an administrator.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/operation-not-allowed":
        return "Email and password sign-in is not enabled for this project.";
      default:
        return "Unable to sign in. Please try again.";
    }
  }

  return "Unable to sign in. Please try again.";
}

export default function AdminLogin() {
  const { user, loading, configurationError, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requestedPath = (location.state as { from?: unknown } | null)?.from;
  const destination =
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/admin/") &&
    requestedPath !== "/admin/login"
      ? requestedPath
      : "/admin";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-700">
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
          <span>Checking sign-in…</span>
        </div>
      </main>
    );
  }

  if (user) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    try {
      setSubmitting(true);
      await signIn(normalizedEmail, password);
    } catch (signInError) {
      setError(getSignInErrorMessage(signInError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-teal-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/10 sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <AbvoltLogo className="mb-6 h-12 w-auto" />
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-800">
            <LockKeyhole size={22} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your administrator account to manage ABVOLT content.
          </p>
        </div>

        {(configurationError || error) && (
          <div
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {configurationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-slate-800">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              placeholder="name@example.com"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-800">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              placeholder="Enter your password"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || Boolean(configurationError)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-3 font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Administrator access only. Contact your project administrator if you need an account.
        </p>
      </section>
    </main>
  );
}
