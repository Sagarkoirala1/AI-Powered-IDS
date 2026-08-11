import { useState } from "react";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "./FormField.jsx";

const SESSION_KEY = "ids_admin_verified";

export function isAdminVerified() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export default function AdminVerifyGate({ onVerified }) {
  const { user, verifyAdminPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await verifyAdminPassword(user.email, password);
      if (res?.success) {
        sessionStorage.setItem(SESSION_KEY, "true");
        onVerified();
      } else {
        setError(res?.message || "Incorrect password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect password. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-base-line bg-base-panel p-6 shadow-panel">
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck size={20} className="text-signal" />
          <h1 className="font-display text-lg font-semibold text-ink">Confirm admin access</h1>
        </div>
        <p className="mb-6 text-sm text-ink-muted">
          For security, re-enter your password to unlock the Admin panel.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Email" type="email" value={user?.email || ""} disabled readOnly />
          <FormField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p className="rounded-md border border-state-critical/30 bg-state-critical/10 px-3 py-2 text-sm text-state-critical">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !password}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {submitting ? "Verifying…" : "Unlock admin panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
