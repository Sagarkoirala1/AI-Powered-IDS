// Client-side CSV report export. No backend call needed — takes whatever
// alert rows are already in memory (e.g. the filtered Alerts table, or the
// full admin alert list) and turns them into a downloadable .csv file.

const REPORT_COLUMNS = [
  { key: "sourceIP", label: "Source IP" },
  { key: "destinationIP", label: "Destination IP" },
  { key: "protocol", label: "Protocol" },
  { key: "attackType", label: "Attack Type" },
  { key: "severity", label: "Severity" },
  { key: "confidence", label: "Confidence (%)" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Detected At" },
];

function escapeCsvValue(value) {
  const str = value === undefined || value === null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString();
}

export function alertsToCsv(alerts) {
  const header = REPORT_COLUMNS.map((c) => escapeCsvValue(c.label)).join(",");
  const rows = alerts.map((a) =>
    REPORT_COLUMNS.map((c) => {
      const raw = c.key === "createdAt" ? formatTimestamp(a[c.key]) : a[c.key];
      return escapeCsvValue(raw);
    }).join(",")
  );
  return [header, ...rows].join("\r\n");
}

export function downloadAlertsReport(alerts, filename = "intrusion-alerts-report.csv") {
  const csv = alertsToCsv(alerts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
