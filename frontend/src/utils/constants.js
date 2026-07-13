export const SEVERITY_STYLES = {
  Low: { dot: "bg-state-low", text: "text-state-low", border: "border-state-low/40" },
  Medium: { dot: "bg-state-medium", text: "text-state-medium", border: "border-state-medium/40" },
  High: { dot: "bg-state-high", text: "text-state-high", border: "border-state-high/40" },
  Critical: { dot: "bg-state-critical", text: "text-state-critical", border: "border-state-critical/40" },
};

export const STATUS_STYLES = {
  Active: { text: "text-state-critical", bg: "bg-state-critical/10", border: "border-state-critical/30" },
  Resolved: { text: "text-state-safe", bg: "bg-state-safe/10", border: "border-state-safe/30" },
};

export const SEVERITY_ORDER = ["Low", "Medium", "High", "Critical"];
