import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { handleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await handleLogin(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="logo-text">VANITY</span>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 6 }}>
            Startup Onboarding & Activation Engine
          </p>
        </div>

        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
          Welcome back
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 28 }}>
          Sign in to continue to your dashboard
        </p>

        {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email address</label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent-light)", fontWeight: 600, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
