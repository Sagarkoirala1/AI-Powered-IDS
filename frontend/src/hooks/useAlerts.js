import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import samples from "../samples";


const POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL) || 5000;

/**
 * Polls GET /api/alerts and GET /api/alerts/stats on an interval.
 *
 * The backend ships with a socket.io dependency but doesn't emit alert
 * events yet. Once it does, swap the setInterval below for a socket
 * listener (`socket.on("alert:new", refetch)`) and the rest of the app
 * — which only consumes { alerts, stats, loading, error, refetch } —
 * won't need to change.
 */
export function useAlerts({ pollIntervalMs = POLL_INTERVAL, auto = true } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetchAll = useCallback(async ({ silent } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [alertsRes, statsRes] = await Promise.all([
        api.get("/alerts"),
        api.get("/alerts/stats"),
      ]);
      setAlerts(alertsRes.data.data);
      setStats(statsRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't reach the alerts service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    if (!auto) return;
    timerRef.current = setInterval(() => fetchAll({ silent: true }), pollIntervalMs);
    return () => clearInterval(timerRef.current);
  }, [fetchAll, auto, pollIntervalMs]);

  const updateStatus = useCallback(async (id, status) => {
    await api.put(`/alerts/${id}/status`, { status });
    await fetchAll({ silent: true });
  }, [fetchAll]);

  const removeAlert = useCallback(async (id) => {
    await api.delete(`/alerts/${id}`);
    await fetchAll({ silent: true });
  }, [fetchAll]);

  /**
   * Runs a client-side simulated traffic check (see utils/simulate.js).
   * If it comes back positive, it logs a real alert through the existing
   * POST /alerts endpoint so it shows up in the table/stats like any
   * other alert. No AI/ML or backend code is touched by this.
   */
const simulateIntrusion = useCallback(async () => {

    // Pick a random sample
    const sample = samples[Math.floor(Math.random() * samples.length)];

    // Send sample to backend
    const response = await api.post("/predict", sample);

    // Refresh dashboard
    await fetchAll({ silent: true });

    return {

        detected: response.data.detected,

        sample: {

            sourceIP: sample.sourceIP,

            destinationIP: sample.destinationIP,

            protocol: sample.protocol,

            attackType: response.data.prediction,

            confidence: response.data.confidence,

            severity: response.data.alert?.severity || "None"

        }

    };

}, [fetchAll]);

  return { alerts, stats, loading, error, refetch: fetchAll, updateStatus, removeAlert, simulateIntrusion };
}
