import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ROLES = [
  { value: "developer", label: "🛠 Developer", desc: "Build integrations & APIs" },
  { value: "founder", label: "🚀 Founder", desc: "Create & manage your product" },
  { value: "marketer", label: "🎯 Marketer", desc: "Drive growth & campaigns" },
];

export default function Register() {
  const { handleRegister } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await handleRegister(email, password, role);
      setSuccess("Account created! Redirecting to login...");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Try a different email.");
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
          Create your account
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 28 }}>
          Get started in under 60 seconds
        </p>

        {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: 20 }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email address</label>
            <input
              id="register-email"
              type="email"
              className="input-field"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Password</label>
            <input
              id="register-password"
              type="password"
              className="input-field"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Your role</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  id={`role-${r.value}`}
                  onClick={() => setRole(r.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `1px solid ${role === r.value ? "var(--accent)" : "var(--border)"}`,
                    background: role === r.value ? "rgba(124,58,237,0.1)" : "var(--bg-surface)",
                    color: role === r.value ? "var(--accent-light)" : "var(--text-secondary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{r.label.split(" ")[0]}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: role === r.value ? "var(--accent-light)" : "var(--text-primary)" }}>
                      {r.label.split(" ").slice(1).join(" ")}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-light)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
