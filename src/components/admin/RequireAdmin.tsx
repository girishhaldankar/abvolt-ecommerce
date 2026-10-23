import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-700">
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
          <span>Checking administrator sign-in…</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <Outlet />;
}
