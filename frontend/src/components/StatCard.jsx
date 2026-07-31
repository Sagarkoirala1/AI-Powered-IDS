export default function StatCard({ label, value, tone = "default", icon: Icon }) {
  const toneMap = {
    default: "text-ink",
    critical: "text-state-critical",
    active: "text-signal",
    safe: "text-state-safe",
  };
  return (
    <div className="rounded-lg border border-base-line bg-base-panel p-4 shadow-panel">
      <div className="flex items-center justify-between text-ink-muted">
        <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
        {Icon ? <Icon size={16} strokeWidth={1.75} /> : null}
      </div>
      <div className={`mt-2 font-mono text-3xl font-semibold ${toneMap[tone]}`}>{value}</div>
    </div>
  );
}
