import { Navigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLES } from "../utils/constants.js";
import AppShell from "./AppShell.jsx";

// Wrap this INSIDE <ProtectedRoute> (auth is already guaranteed there).
// It only checks the role and, if the signed-in user isn't an admin,
// shows a friendly "not allowed" screen instead of the admin page.
export default function AdminRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== ROLES.ADMIN) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-base-line px-6 py-20 text-center">
          <ShieldOff size={28} className="text-state-critical" />
          <h1 className="font-display text-lg font-semibold text-ink">Admin access required</h1>
          <p className="max-w-sm text-sm text-ink-muted">
            You're signed in as <span className="font-mono">{user.role}</span>. Only admins can
            upload traffic, run models, and manage alerts from this page.
          </p>
        </div>
      </AppShell>
    );
  }

  return children;
}
