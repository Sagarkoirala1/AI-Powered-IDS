import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import AlertsTable from "../components/AlertsTable.jsx";
import { useAlerts } from "../hooks/useAlerts.js";
import { SEVERITY_ORDER } from "../utils/constants.js";

export default function Alerts() {
  const { alerts, loading, error, updateStatus, removeAlert } = useAlerts();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (severity !== "All" && a.severity !== severity) return false;
      if (status !== "All" && a.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${a.sourceIP} ${a.destinationIP} ${a.attackType} ${a.protocol}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [alerts, query, severity, status]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Alerts</h1>
        <p className="text-sm text-ink-muted">
          {loading ? "Loading…" : `${filtered.length} of ${alerts.length} alerts shown`}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-state-critical/30 bg-state-critical/10 px-4 py-3 text-sm text-state-critical">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by IP, attack type, or protocol…"
            className="w-full rounded-md border border-base-line bg-base-panel py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-signal"
          />
        </div>

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-md border border-base-line bg-base-panel px-3 py-2 text-sm text-ink focus:border-signal"
        >
          <option value="All">All severities</option>
          {SEVERITY_ORDER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-base-line bg-base-panel px-3 py-2 text-sm text-ink focus:border-signal"
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-ink-faint">Loading alerts…</p>
      ) : (
        <AlertsTable
          alerts={filtered}
          onResolve={(id) => updateStatus(id, "Resolved")}
          onDelete={removeAlert}
        />
      )}
    </AppShell>
  );
}
