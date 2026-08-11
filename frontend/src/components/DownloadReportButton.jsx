import { useState } from "react";
import { Download, Check } from "lucide-react";
import { downloadAlertsReport } from "../utils/exportReport.js";

export default function DownloadReportButton({ alerts, filename, label = "Download PDF Report", className = "" }) {
  const [justDownloaded, setJustDownloaded] = useState(false);
  const disabled = !alerts || alerts.length === 0;

  const handleClick = () => {
    if (disabled) return;
    downloadAlertsReport(alerts, filename);
    setJustDownloaded(true);
    setTimeout(() => setJustDownloaded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={disabled ? "No alerts to export" : `Download ${alerts.length} alert(s) as PDF`}
      className={`flex items-center gap-2 rounded-md border border-base-line px-4 py-2 text-sm font-medium text-ink-muted hover:border-signal/50 hover:text-signal disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {justDownloaded ? <Check size={16} className="text-state-safe" /> : <Download size={16} />}
      {justDownloaded ? "Downloaded" : label}
    </button>
  );
}