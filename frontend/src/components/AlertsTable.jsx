import { Link } from "react-router-dom";
import { Check, Trash2 } from "lucide-react";
import SeverityBadge from "./SeverityBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertsTable({ alerts, onResolve, onDelete, compact = false }) {
  if (!alerts.length) {
    return (
      <div className="rounded-lg border border-dashed border-base-line px-6 py-10 text-center">
        <p className="text-sm text-ink-muted">No alerts here.</p>
        <p className="mt-1 font-mono text-xs text-ink-faint">
          Nothing has tripped detection yet — that's a good sign.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-base-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-base-line bg-base-panel/60 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            <th className="px-4 py-3">Source → Destination</th>
            <th className="px-4 py-3">Attack type</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Detected</th>
            {!compact && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a._id} className="border-b border-base-line/60 last:border-0 hover:bg-base-alt/40">
              <td className="px-4 py-3">
                <Link to={`/alerts/${a._id}`} className="font-mono text-xs text-ink hover:text-signal">
                  {a.sourceIP} <span className="text-ink-faint">→</span> {a.destinationIP}
                </Link>
                <div className="font-mono text-[11px] text-ink-faint">{a.protocol}</div>
              </td>
              <td className="px-4 py-3 text-ink">{a.attackType}</td>
              <td className="px-4 py-3">
                <SeverityBadge severity={a.severity} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-ink-muted">{a.confidence}%</td>
              <td className="px-4 py-3">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-ink-faint">{formatTime(a.createdAt)}</td>
              {!compact && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    {a.status !== "Resolved" && (
                      <button
                        onClick={() => onResolve?.(a._id)}
                        title="Mark resolved"
                        className="rounded-md border border-base-line p-1.5 text-ink-muted hover:border-state-safe/50 hover:text-state-safe"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete?.(a._id)}
                      title="Delete alert"
                      className="rounded-md border border-base-line p-1.5 text-ink-muted hover:border-state-critical/50 hover:text-state-critical"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
