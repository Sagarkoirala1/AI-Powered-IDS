import { useMemo, useState } from "react";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Flame,
  PlayCircle,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import AppShell from "../components/AppShell.jsx";
import StatCard from "../components/StatCard.jsx";
import SignalStrip from "../components/SignalStrip.jsx";
import AlertsTable from "../components/AlertsTable.jsx";
import { useAlerts } from "../hooks/useAlerts.js";
import { SEVERITY_ORDER } from "../utils/constants.js";

const SEVERITY_COLORS = {
  Low: "#7FA9C7",
  Medium: "#E8A33D",
  High: "#F0793C",
  Critical: "#E5484D",
};

export default function Dashboard() {
  const { alerts, stats, loading, error, updateStatus, removeAlert, simulateIntrusion } = useAlerts();
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const result = await simulateIntrusion();
      setSimResult(result);
    } catch (err) {
      setSimResult({ detected: false, sampleError: true });
    } finally {
      setSimulating(false);
      setTimeout(() => setSimResult(null), 7000);
    }
  };

  const severityData = useMemo(() => {
    const counts = Object.fromEntries(SEVERITY_ORDER.map((s) => [s, 0]));
    alerts.forEach((a) => {
      if (counts[a.severity] !== undefined) counts[a.severity] += 1;
    });
    return SEVERITY_ORDER.map((s) => ({ name: s, value: counts[s] }));
  }, [alerts]);

  const attackTypeData = useMemo(() => {
    const counts = {};
    alerts.forEach((a) => {
      counts[a.attackType] = (counts[a.attackType] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [alerts]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
          <p className="text-sm text-ink-muted">Live status of monitored network traffic.</p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center gap-2 self-start rounded-md border border-signal/40 bg-signal/10 px-4 py-2 text-sm font-medium text-signal transition-colors hover:bg-signal/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {simulating ? (
            <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />
          ) : (
            <PlayCircle size={16} strokeWidth={1.75} />
          )}
          {simulating ? "Running simulation…" : "Simulate Intrusion"}
        </button>
      </div>

      {simResult && (
        <div
          className={`mb-6 flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${
            simResult.detected
              ? "border-state-critical/30 bg-state-critical/10 text-state-critical"
              : "border-state-safe/30 bg-state-safe/10 text-state-safe"
          }`}
        >
          {simResult.detected ? (
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          )}
          <span>
            {simResult.sampleError
              ? "Simulation failed — couldn't reach the alerts service."
              : simResult.detected
              ? `Intrusion detected — ${simResult.sample.attackType} (${simResult.sample.severity}) from ${simResult.sample.sourceIP} → ${simResult.sample.destinationIP}, ${simResult.sample.confidence}% confidence. Alert logged below.`
              : `No intrusion detected — simulated ${simResult.sample.protocol} traffic from ${simResult.sample.sourceIP} looked clean (${simResult.sample.confidence}% confidence).`}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md border border-state-critical/30 bg-state-critical/10 px-4 py-3 text-sm text-state-critical">
          {error}
        </div>
      )}

      <div className="mb-6">
        <SignalStrip activeCount={stats.active} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total alerts" value={stats.total} icon={Activity} />
        <StatCard label="Active" value={stats.active} tone="active" icon={ShieldAlert} />
        <StatCard label="Critical" value={stats.critical} tone="critical" icon={Flame} />
        <StatCard label="Resolved" value={stats.resolved} tone="safe" icon={ShieldCheck} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-lg border border-base-line bg-base-panel p-4 lg:col-span-2">
          <h2 className="mb-1 font-display text-sm font-semibold text-ink">Severity breakdown</h2>
          <p className="mb-3 font-mono text-[11px] text-ink-faint">Current alert set, by severity</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {severityData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#152528", border: "1px solid #2A4247", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#E7EFEF" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3">
            {severityData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_COLORS[d.name] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-base-line bg-base-panel p-4 lg:col-span-3">
          <h2 className="mb-1 font-display text-sm font-semibold text-ink">Top attack types</h2>
          <p className="mb-3 font-mono text-[11px] text-ink-faint">Most frequent classifications detected</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackTypeData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A4247" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#8FA8AB", fontSize: 11 }} stroke="#2A4247" allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#8FA8AB", fontSize: 11 }} stroke="#2A4247" width={120} />
                <Tooltip
                  cursor={{ fill: "rgba(232,163,61,0.08)" }}
                  contentStyle={{ background: "#152528", border: "1px solid #2A4247", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#E7EFEF" }}
                />
                <Bar dataKey="count" fill="#E8A33D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-ink">Recent alerts</h2>
        </div>
        {loading ? (
          <p className="font-mono text-xs text-ink-faint">Loading alerts…</p>
        ) : (
          <AlertsTable
            alerts={alerts.slice(0, 6)}
            onResolve={(id) => updateStatus(id, "Resolved")}
            onDelete={removeAlert}
          />
        )}
      </div>
    </AppShell>
  );
}
