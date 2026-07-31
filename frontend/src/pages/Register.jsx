import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthLayout from "../components/AuthLayout.jsx";
import FormField from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Set up analyst access to the console.">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="Username"
          name="username"
          autoComplete="username"
          required
          minLength={3}
          value={form.username}
          onChange={onChange}
          placeholder="j.analyst"
        />
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
          autoComplete="new-password"
          required
          minLength={6}
          value={form.password}
          onChange={onChange}
          placeholder="At least 6 characters"
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
          <UserPlus size={16} />
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-signal hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
