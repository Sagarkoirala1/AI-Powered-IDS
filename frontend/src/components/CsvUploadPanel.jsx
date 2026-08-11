import { useRef, useState } from "react";
import { UploadCloud, FileText, Cpu, Loader2, CheckCircle2, AlertTriangle, X, PlayCircle } from "lucide-react";
import { AI_MODELS } from "../utils/constants.js";

export default function CsvUploadPanel({ onUpload }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [model, setModel] = useState(AI_MODELS[0].value);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const pickFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file of captured network traffic.");
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Select a CSV file first.");
      return;
    }
    setError("");
    setResult(null);
    setUploading(true);
    try {
      const res = await onUpload(file, model);
      setResult(res?.data || { ok: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't scan that file — the analysis service may be unreachable."
      );
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-lg border border-base-line bg-base-panel p-4">
      <h2 className="mb-1 font-display text-sm font-semibold text-ink">Run test: scan traffic (CSV)</h2>
      <p className="mb-4 font-mono text-[11px] text-ink-faint">
        Upload captured traffic, pick a model, then run the test to check for intrusions.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragOver ? "border-signal bg-signal/5" : "border-base-line hover:border-signal/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {file ? (
            <>
              <FileText size={22} className="text-signal" />
              <p className="text-sm text-ink">{file.name}</p>
              <p className="font-mono text-[11px] text-ink-faint">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="mt-1 flex items-center gap-1 text-xs text-ink-muted hover:text-state-critical"
              >
                <X size={12} /> Remove
              </button>
            </>
          ) : (
            <>
              <UploadCloud size={22} className="text-ink-faint" />
              <p className="text-sm text-ink-muted">Drag & drop a CSV here, or click to browse</p>
              <p className="font-mono text-[11px] text-ink-faint">.csv only</p>
            </>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-ink-muted">
            <Cpu size={12} /> AI model
          </span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-md border border-base-line bg-base-panel px-3 py-2.5 text-sm text-ink focus:border-signal"
          >
            {AI_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="rounded-md border border-state-critical/30 bg-state-critical/10 px-3 py-2 text-sm text-state-critical">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
          {uploading ? "Running test…" : "Run Test"}
        </button>
      </form>

      {result && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-state-safe/30 bg-state-safe/10 px-4 py-3 text-sm text-state-safe">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Test complete</p>
            <p className="mt-1 text-ink-muted">
              {typeof result.totalRows === "number" && `${result.totalRows} rows analyzed`}
              {typeof result.intrusionsDetected === "number" &&
                ` — ${result.intrusionsDetected} intrusion(s) flagged`}
              {result.modelUsed && ` using ${result.modelUsed}`}.
            </p>
            {Array.isArray(result.alerts) && result.alerts.length === 0 && (
              <p className="mt-1 flex items-center gap-1 text-ink-muted">
                <AlertTriangle size={12} /> No malicious traffic found in this file.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
