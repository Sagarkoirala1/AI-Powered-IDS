// Signature element: a telemetry waveform with a sweeping scan line,
// standing in for "live network signal" without needing real packet data.
const BARS = 64;

function seededBars(seed) {
  return Array.from({ length: BARS }, (_, i) => {
    const n = Math.sin(i * 12.9898 + seed) * 43758.5453;
    const frac = n - Math.floor(n);
    return 0.15 + frac * 0.85;
  });
}

export default function SignalStrip({ activeCount = 0 }) {
  const bars = seededBars(activeCount + 7);

  return (
    <div className="relative overflow-hidden rounded-lg border border-base-line bg-base-panel px-4 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-signal/10 blur-xl signal-sweep" />
      <div className="relative flex items-end gap-[3px] h-10">
        {bars.map((h, i) => {
          const isHot = activeCount > 0 && i % Math.max(1, Math.floor(BARS / Math.min(activeCount, 8))) === 0;
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm ${isHot ? "bg-signal" : "bg-base-line"}`}
              style={{ height: `${h * 100}%` }}
            />
          );
        })}
      </div>
      <div className="relative mt-2 flex items-center justify-between font-mono text-[11px] text-ink-faint">
        <span>TRAFFIC TELEMETRY</span>
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-signal" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          LIVE
        </span>
      </div>
    </div>
  );
}
