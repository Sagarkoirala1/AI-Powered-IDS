import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ids_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ids_token");
    if (!token) {
      setInitializing(false);
      return;
    }
    // Validate the stored token against the backend on load
    api
      .get("/users/profile")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("ids_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("ids_token");
        localStorage.removeItem("ids_user");
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("ids_token", res.data.token);
    localStorage.setItem("ids_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("ids_token", res.data.token);
    localStorage.setItem("ids_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ids_token");
    localStorage.removeItem("ids_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
