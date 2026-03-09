import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";

export default function Settings() {
    const { user } = useContext(AuthContext);
    const { handleLogout } = useAuth();


    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                        Settings
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        Manage your account and preferences
                    </p>
                </div>

                {/* Profile Card */}
                <div className="glass-card" style={{ padding: 32, marginBottom: 24, maxWidth: 560 }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>
                        👤 Profile
                    </h3>

                    <div style={{ marginBottom: 16 }}>
                        <label className="form-label">Email</label>
                        <input
                            className="input-field"
                            value={user?.email || ""}
                            disabled
                            style={{ opacity: 0.6 }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label className="form-label">Role</label>
                        <input
                            className="input-field"
                            value={user?.role || "Not set"}
                            disabled
                            style={{ opacity: 0.6 }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label">Onboarding Status</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className={`badge ${user?.onboardingCompleted ? "badge-green" : "badge-yellow"}`}>
                                {user?.onboardingCompleted ? "✓ Completed" : "⏳ In Progress"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Preferences Card */}
                <div className="glass-card" style={{ padding: 32, marginBottom: 24, maxWidth: 560 }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>
                        ⚙️ Preferences
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                        <div>
                            <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500 }}>Email Notifications</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Receive email updates about your projects</p>
                        </div>
                        <div style={{
                            width: 44, height: 24, borderRadius: 12,
                            background: "var(--accent)", cursor: "pointer",
                            position: "relative", transition: "all 0.2s",
                        }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: "50%",
                                background: "white", position: "absolute",
                                top: 3, right: 3, transition: "all 0.2s",
                            }} />
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
                        <div>
                            <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500 }}>Dark Mode</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Always enabled for maximum style</p>
                        </div>
                        <div style={{
                            width: 44, height: 24, borderRadius: 12,
                            background: "var(--accent)", cursor: "pointer",
                            position: "relative",
                        }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: "50%",
                                background: "white", position: "absolute",
                                top: 3, right: 3,
                            }} />
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="glass-card" style={{ padding: 32, maxWidth: 560, borderColor: "rgba(239, 68, 68, 0.3)" }}>
                    <h3 style={{ color: "var(--error)", fontWeight: 700, marginBottom: 12 }}>
                        ⚠️ Danger Zone
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 20 }}>
                        Signing out will clear your local session. You can always log back in.
                    </p>
                    <button
                        className="btn-primary"
                        style={{ background: "var(--error)" }}
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
            </main>
        </div>
    );
}
