import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import api from "../api/axios.js";

function Field({ label, value, mono = true }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className={`mt-1 text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export default function AlertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/alerts/${id}`);
      setAlert(res.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load this alert.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async () => {
    setBusy(true);
    try {
      await api.put(`/alerts/${id}/status`, { status: "Resolved" });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/alerts/${id}`);
      navigate("/alerts");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {loading && <p className="font-mono text-xs text-ink-faint">Loading…</p>}

      {error && (
        <div className="rounded-md border border-state-critical/30 bg-state-critical/10 px-4 py-3 text-sm text-state-critical">
          {error}
        </div>
      )}

      {alert && (
        <div className="max-w-2xl rounded-lg border border-base-line bg-base-panel p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">{alert.attackType}</h1>
              <p className="mt-1 font-mono text-xs text-ink-faint">ID {alert._id}</p>
            </div>
            <div className="flex gap-2">
              <SeverityBadge severity={alert.severity} />
              <StatusBadge status={alert.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Source IP" value={alert.sourceIP} />
            <Field label="Destination IP" value={alert.destinationIP} />
            <Field label="Protocol" value={alert.protocol} />
            <Field label="Confidence" value={`${alert.confidence}%`} />
            <Field label="Detected" value={new Date(alert.createdAt).toLocaleString()} />
            <Field label="Last updated" value={new Date(alert.updatedAt).toLocaleString()} />
          </div>

          <div className="mt-8 flex gap-2 border-t border-base-line pt-6">
            {alert.status !== "Resolved" && (
              <button
                onClick={resolve}
                disabled={busy}
                className="flex items-center gap-2 rounded-md border border-state-safe/40 px-4 py-2 text-sm text-state-safe hover:bg-state-safe/10 disabled:opacity-50"
              >
                <Check size={15} />
                Mark resolved
              </button>
            )}
            <button
              onClick={remove}
              disabled={busy}
              className="flex items-center gap-2 rounded-md border border-state-critical/40 px-4 py-2 text-sm text-state-critical hover:bg-state-critical/10 disabled:opacity-50"
            >
              <Trash2 size={15} />
              Delete alert
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
