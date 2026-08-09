import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import { runSimulatedScan } from "../utils/simulate.js";

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

  // -----------------------------
  // Simulate an intrusion (Dashboard "Simulate" button)
  // -----------------------------
  const simulateIntrusion = useCallback(
    async (attackKey) => {
      const result = runSimulatedScan(attackKey);
      if (result.detected) {
        await api.post("/alerts", result.sample);
        await fetchAll({ silent: true });
      }
      return result;
    },
    [fetchAll]
  );

  // -----------------------------
  // Admin: upload a CSV of captured traffic for the AI model to scan
  // -----------------------------
  const uploadCsv = useCallback(
    async (file, model) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", model || "auto");

      const res = await api.post("/alerts/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchAll({ silent: true });
      return res.data; // { success, data: { totalRows, intrusionsDetected, modelUsed, alerts } }
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
    simulateIntrusion,
    uploadCsv,
    refresh: fetchAll,
  };
}

export default useAlerts;