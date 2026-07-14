import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign in. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Access the intrusion detection console.">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
          placeholder="you@company.com"
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
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
          <LogIn size={16} />
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        No account yet?{" "}
        <Link to="/register" className="text-signal hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
