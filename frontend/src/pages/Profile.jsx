import { ShieldCheck } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Profile</h1>
        <p className="text-sm text-ink-muted">Your account on this console.</p>
      </div>

      <div className="max-w-md rounded-lg border border-base-line bg-base-panel p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal/10 text-signal">
            <ShieldCheck size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink">{user?.username}</p>
            <p className="font-mono text-xs text-ink-faint uppercase">{user?.role}</p>
          </div>
        </div>

        <dl className="space-y-4 border-t border-base-line pt-4">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Email</dt>
            <dd className="mt-1 text-sm text-ink">{user?.email}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">User ID</dt>
            <dd className="mt-1 font-mono text-sm text-ink">{user?.id}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Access level</dt>
            <dd className="mt-1 text-sm text-ink">{user?.role}</dd>
          </div>
        </dl>
      </div>
    </AppShell>
  );
}
