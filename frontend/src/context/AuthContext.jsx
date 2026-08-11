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

  api
    .get("/auth/profile")
    .then((res) => {
      console.log("PROFILE SUCCESS:", res.data);

      setUser(res.data.user);
      localStorage.setItem("ids_user", JSON.stringify(res.data.user));
    })
    .catch((err) => {
      console.error("PROFILE VALIDATION FAILED");
      console.error("Status:", err.response?.status);
      console.error("Response:", err.response?.data);
      console.error("Error:", err.message);

      // DON'T DELETE token yet
      setInitializing(false);
    })
    .finally(() => setInitializing(false));
}, []);

  // Plain email/password sign-in - no OTP step.
  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("ids_token", res.data.token);
    localStorage.setItem("ids_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // Registration: Step 1 - submit details, backend emails a verification OTP.
  const registerRequestOtp = useCallback(async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    return res.data; // { success, otpRequired, message, email }
  }, []);

  // Registration: Step 2 - verify the emailed OTP, which creates the account
  // and completes sign-in.
  const verifyRegisterOtp = useCallback(async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    localStorage.setItem("ids_token", res.data.token);
    localStorage.setItem("ids_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const resendRegisterOtp = useCallback(async (email) => {
    const res = await api.post("/auth/resend-register-otp", { email });
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

  // Re-verify credentials before granting access to the Admin panel
  // (reuses the existing password check on /auth/login; doesn't touch the
  // active session token).
  const verifyAdminPassword = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data; // { success, message, ... }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ids_token");
    localStorage.removeItem("ids_user");
    sessionStorage.removeItem("ids_admin_verified");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        login,
        registerRequestOtp,
        verifyRegisterOtp,
        resendRegisterOtp,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        verifyAdminPassword,
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
