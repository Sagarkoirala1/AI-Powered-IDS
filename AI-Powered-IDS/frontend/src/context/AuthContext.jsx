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

  // Step 1: validate credentials -> backend emails a sign-in OTP
  const requestLoginOtp = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data; // { success, otpRequired, message, email }
  }, []);

  // Step 2: verify the emailed OTP -> completes sign-in
  const verifyLoginOtp = useCallback(async (email, otp) => {
    const res = await api.post("/auth/verify-login-otp", { email, otp });
    localStorage.setItem("ids_token", res.data.token);
    localStorage.setItem("ids_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const resendLoginOtp = useCallback(async (email) => {
    const res = await api.post("/auth/resend-login-otp", { email });
    return res.data;
  }, []);

  // Forgot password: Step 1 - request an OTP by email
  const forgotPassword = useCallback(async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  }, []);

  // Forgot password: Step 2 - verify the OTP, get a short-lived reset token
  const verifyResetOtp = useCallback(async (email, otp) => {
    const res = await api.post("/auth/verify-reset-otp", { email, otp });
    return res.data; // { resetToken, email }
  }, []);

  // Forgot password: Step 3 - set the new password
  const resetPassword = useCallback(async (email, resetToken, newPassword) => {
    const res = await api.post("/auth/reset-password", { email, resetToken, newPassword });
    return res.data;
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
    <AuthContext.Provider
      value={{
        user,
        initializing,
        requestLoginOtp,
        verifyLoginOtp,
        resendLoginOtp,
        register,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
