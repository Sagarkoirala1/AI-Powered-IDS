export default function FormField({ label, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-mono uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <input
        {...inputProps}
        className={`w-full rounded-md border bg-base-panel px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-signal ${
          error ? "border-state-critical" : "border-base-line"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-state-critical">{error}</span>}
    </label>
  );
}
