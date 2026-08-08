import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (!email || !resetToken) {
    return (
      <AuthLayout title="Reset password" subtitle="Session expired.">
        <p className="text-sm text-ink-muted">
          Please{" "}
          <Link to="/login" className="text-signal hover:underline">
            start again from sign in
          </Link>{" "}
          to request a new reset code.
        </p>
      </AuthLayout>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, resetToken, form.password);
      navigate("/login", {
        replace: true,
        state: { message: "Password updated. Please sign in." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't reset the password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create new password" subtitle={`Set a new password for ${email}.`}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="New password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={form.password}
          onChange={onChange}
          placeholder="At least 6 characters"
        />
        <FormField
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={6}
          value={form.confirmPassword}
          onChange={onChange}
          placeholder="Re-enter your new password"
        />

        {error && (
          <p className="rounded-md border border-state-critical/30 bg-state-critical/10 px-3 py-2 text-sm text-state-critical">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <KeyRound size={16} />
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
