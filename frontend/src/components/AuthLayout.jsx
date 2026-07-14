import { Radar } from "lucide-react";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-base text-ink lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-base-line bg-base-panel/40 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="flex items-center gap-2">
          <Radar className="text-signal" size={22} strokeWidth={1.75} />
          <span className="font-display text-base font-semibold tracking-wide">Sentry IDS</span>
        </div>

        <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="pulse-ring absolute inline-flex h-24 w-24 rounded-full border border-signal/40"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          ))}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-signal/60 bg-base-panel">
            <Radar className="text-signal" size={30} strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <p className="font-display text-lg leading-snug text-ink">
            Real-time visibility into every packet that crosses your network.
          </p>
          <p className="mt-2 font-mono text-xs text-ink-faint">
            Anomaly detection · Alert triage · Response tracking
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <Radar className="text-signal" size={20} />
            <span className="font-display text-sm font-semibold">Sentry IDS</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
