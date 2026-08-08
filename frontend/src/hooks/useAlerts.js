import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios.js";

const POLL_INTERVAL =
  Number(import.meta.env.VITE_POLL_INTERVAL) || 5000;

export function useAlerts({
  pollIntervalMs = POLL_INTERVAL,
  auto = true,
} = {}) {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    critical: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);

  // -----------------------------
  // Fetch alerts + statistics
  // -----------------------------
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
      setError(
        err.response?.data?.message ||
          "Couldn't reach the alerts service."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    if (!auto) return;

    timerRef.current = setInterval(() => {
      fetchAll({ silent: true });
    }, pollIntervalMs);

    return () => clearInterval(timerRef.current);
  }, [fetchAll, auto, pollIntervalMs]);

  // -----------------------------
  // Update alert status
  // -----------------------------
  const updateStatus = useCallback(
    async (id, status) => {
      await api.put(`/alerts/${id}/status`, { status });
      await fetchAll({ silent: true });
    },
    [fetchAll]
  );

  // -----------------------------
  // Delete alert
  // -----------------------------
  const removeAlert = useCallback(
    async (id) => {
      await api.delete(`/alerts/${id}`);
      await fetchAll({ silent: true });
    },
    [fetchAll]
  );

  return {
    alerts,
    stats,
    loading,
    error,
    updateStatus,
    removeAlert,
    refresh: fetchAll,
  };
}

export default useAlerts;