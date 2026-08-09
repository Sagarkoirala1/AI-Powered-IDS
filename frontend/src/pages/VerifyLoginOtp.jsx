import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import OtpInput from "../components/OtpInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyLoginOtp() {
  const { verifyLoginOtp, resendLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) {
    return (
      <AuthLayout title="Sign in" subtitle="Session expired.">
        <p className="text-sm text-ink-muted">
          Please{" "}
          <Link to="/login" className="text-signal hover:underline">
            sign in again
          </Link>{" "}
          to receive a new code.
        </p>
      </AuthLayout>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await verifyLoginOtp(email, otp);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await resendLoginOtp(email);
      setInfo("A new code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Enter sign-in code"
      subtitle={`We sent a 6-digit code to ${email}.`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <OtpInput value={otp} onChange={setOtp} />

        {error && (
          <p className="rounded-md border border-state-critical/30 bg-state-critical/10 px-3 py-2 text-sm text-state-critical">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-md border border-state-safe/30 bg-state-safe/10 px-3 py-2 text-sm text-state-safe">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || otp.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <ShieldCheck size={16} />
          {submitting ? "Verifying…" : "Verify & sign in"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-ink-muted">
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="text-signal hover:underline disabled:opacity-50"
        >
          {resending ? "Resending…" : "Resend code"}
        </button>
        <Link to="/login" className="hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
