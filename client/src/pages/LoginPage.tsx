import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { AuthLayout } from "../components/AuthLayout";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@compliancetracker.dev");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Keep every filing deadline off your desk and on ours.">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {error && <p role="alert" style={{ color: "var(--rust)", fontSize: 13, margin: 0 }}>{error}</p>}
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, textAlign: "center" }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, textAlign: "center" }}>
          Demo credentials are pre-filled — just press Sign in.
        </p>
      </form>
    </AuthLayout>
  );
}
