import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FileText, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState("");

  return (
    <aside className="z-10 flex w-48 shrink-0 flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl sm:w-52 md:sticky md:top-0 md:h-screen md:w-60 md:overflow-y-auto">
      <div className="border-b border-gray-700 bg-gray-900 p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Settings size={18} />
          Admin Panel
        </h2>
        <p className="mt-1 text-xs text-gray-400">Manage your content</p>

        <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
          <span
            className="truncate text-xs text-gray-300"
            title={user?.email || undefined}
          >
            {user?.email}
          </span>
          <button
            type="button"
            onClick={async () => {
              setSignOutError("");
              try {
                await signOut();
                navigate("/admin/login", { replace: true });
              } catch {
                setSignOutError("Unable to sign out. Please try again.");
              }
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded border border-gray-600 px-2 py-1 text-xs text-gray-200 hover:bg-gray-700"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
        {signOutError && (
          <p className="mt-2 text-xs text-red-300" role="alert">
            {signOutError}
          </p>
        )}
      </div>

      <nav aria-label="Admin navigation" className="p-3 sm:p-4">
        <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wide text-gray-400 md:block">
          Workspace
        </p>
        <div className="flex flex-wrap gap-2 md:flex-col">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={16} />
            Divisions
          </NavLink>
          <NavLink
            to="/admin/quotes"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <FileText size={16} />
            Quote Enquiries
          </NavLink>
        </div>

        <p className="mt-3 px-3 text-xs text-gray-400 md:mt-5">
          Choose a division from the dashboard to manage its hierarchy.
        </p>
      </nav>
    </aside>
  );
}
