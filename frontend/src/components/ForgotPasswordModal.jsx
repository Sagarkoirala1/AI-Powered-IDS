import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Mail, Send } from "lucide-react";
import FormField from "./FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForgotPasswordModal({ onClose }) {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      navigate("/verify-reset-otp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send the reset code. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-base-line bg-base-panel p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Reset your password</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Enter your account email and we&apos;ll send you a one-time code.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted transition-colors hover:bg-base hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
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
            {submitting ? <Mail size={16} /> : <Send size={16} />}
            {submitting ? "Sending code…" : "Send reset code"}
          </button>
        </form>
      </div>
    </div>
  );
}
