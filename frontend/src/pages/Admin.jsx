import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import CsvUploadPanel from "../components/CsvUploadPanel.jsx";
import AlertsTable from "../components/AlertsTable.jsx";
import StatCard from "../components/StatCard.jsx";
import DownloadReportButton from "../components/DownloadReportButton.jsx";
import { useAlerts } from "../hooks/useAlerts.js";
import { Activity, ShieldAlert, Flame } from "lucide-react";

export default function Admin() {
  const { alerts, stats, loading, error, updateStatus, removeAlert, uploadCsv } = useAlerts();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await removeAlert(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck size={20} className="text-signal" />
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Admin panel</h1>
          <p className="text-sm text-ink-muted">Upload traffic, run the AI models, and manage alerts.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-state-critical/30 bg-state-critical/10 px-4 py-3 text-sm text-state-critical">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CsvUploadPanel onUpload={uploadCsv} />
        </div>

        <div className="grid grid-cols-2 gap-4 self-start lg:col-span-3">
          <StatCard label="Total alerts" value={stats.total} icon={Activity} />
          <StatCard label="Active" value={stats.active} tone="active" icon={ShieldAlert} />
          <StatCard label="Critical" value={stats.critical} tone="critical" icon={Flame} />
          <StatCard label="Resolved" value={stats.resolved} tone="safe" icon={ShieldCheck} />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">Manage alerts</h2>
          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] text-ink-faint">
              {loading ? "Loading…" : `${alerts.length} alert(s)`}
            </p>
            <DownloadReportButton
              alerts={alerts}
              filename="intrusion-alerts-report-admin.csv"
              label="Download report"
            />
          </div>
        </div>
        {loading ? (
          <p className="font-mono text-xs text-ink-faint">Loading alerts…</p>
        ) : (
          <AlertsTable
            alerts={alerts}
            onResolve={(id) => updateStatus(id, "Resolved")}
            onDelete={handleDelete}
          />
        )}
        {deleting && <p className="mt-2 font-mono text-[11px] text-ink-faint">Deleting alert…</p>}
      </div>
    </AppShell>
  );
}
