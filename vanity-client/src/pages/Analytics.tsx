import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { onboardingApi } from "../api/onboardingApi";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function Analytics() {
    const { user } = useContext(AuthContext);
    const [progress, setProgress] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [progRes, projRes] = await Promise.all([
                    onboardingApi.getProgress(),
                    axios.get("/projects"),
                ]);
                setProgress(progRes.data);
                setProjects(projRes.data);
            } catch { }
        };
        load();
    }, []);

    const deployedCount = projects.filter((p) => p.status === "deployed").length;
    const createdCount = projects.filter((p) => p.status === "created").length;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                        Analytics
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        Overview of your onboarding and project metrics
                    </p>
                </div>

                {/* Onboarding Progress Card */}
                <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>
                        📊 Onboarding Progress
                    </h3>
                    {user?.onboardingCompleted ? (
                        <p style={{ color: "var(--success)", fontSize: "1rem" }}>
                            ✅ Onboarding completed!
                        </p>
                    ) : progress ? (
                        <div>
                            <div style={{ display: "flex", gap: 40, marginBottom: 20 }}>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
                                        Completion
                                    </p>
                                    <p style={{ color: "var(--accent-light)", fontSize: "2rem", fontWeight: 800 }}>
                                        {progress.percentage}%
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
                                        Steps Done
                                    </p>
                                    <p style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800 }}>
                                        {progress.completedSteps?.length || 0} / {progress.totalSteps || "?"}
                                    </p>
                                </div>
                            </div>
                            <div className="progress-track" style={{ height: 10 }}>
                                <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: "var(--text-muted)" }}>
                            No progress data yet.
                        </p>
                    )}
                </div>

                {/* Project Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                    <div className="stat-card">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
                            Total Projects
                        </p>
                        <p style={{ color: "var(--text-primary)", fontSize: "2.2rem", fontWeight: 800 }}>{projects.length}</p>
                    </div>
                    <div className="stat-card">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
                            Deployed
                        </p>
                        <p style={{ color: "var(--success)", fontSize: "2.2rem", fontWeight: 800 }}>{deployedCount}</p>
                    </div>
                    <div className="stat-card">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
                            In Progress
                        </p>
                        <p style={{ color: "var(--warning)", fontSize: "2.2rem", fontWeight: 800 }}>{createdCount}</p>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="glass-card" style={{ padding: 32 }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>
                        🕐 Recent Activity
                    </h3>
                    {projects.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {projects.slice(0, 5).map((p) => (
                                <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.status === "deployed" ? "var(--success)" : "var(--warning)", flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>{p.name}</p>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                            {new Date(p.createdAt).toLocaleDateString()} · {p.status}
                                        </p>
                                    </div>
                                    <span className={`badge ${p.status === "deployed" ? "badge-green" : "badge-yellow"}`}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "var(--text-muted)" }}>No activity yet. Create a project to get started.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
