import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { AuthLayout } from "../components/AuthLayout";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create your account. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create an account" subtitle="Track filing deadlines across every client business.">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {error && <p role="alert" style={{ color: "var(--rust)", fontSize: 13, margin: 0 }}>{error}</p>}
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Password
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, textAlign: "center" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
