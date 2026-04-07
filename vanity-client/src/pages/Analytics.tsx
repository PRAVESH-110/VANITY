import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { onboardingApi } from "../api/onboardingApi";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function Analytics() {
    const { user } = useContext(AuthContext);
    const role = user?.role || "developer";
    const [progress, setProgress] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const progRes = await onboardingApi.getProgress();
                setProgress(progRes.data);
            } catch {}

            // Load role-specific data
            if (role === "developer" || role === "founder") {
                try { const r = await axios.get("/projects"); setProjects(r.data); } catch {}
            }
            if (role === "marketer") {
                try { const r = await axios.get("/campaigns"); setCampaigns(r.data); } catch {}
            }
            if (role === "founder") {
                try { const r = await axios.get("/team"); setTeam(r.data); } catch {}
                try { const r = await axios.get("/milestones"); setMilestones(r.data); } catch {}
            }
        };
        load();
    }, [role]);

    // Developer stats
    const deployedCount = projects.filter((p) => p.status === "deployed").length;
    const createdCount = projects.filter((p) => p.status === "created").length;
    const failedCount = projects.filter((p) => p.status === "failed").length;

    // Marketer stats
    const launchedCampaigns = campaigns.filter((c) => c.status === "launched").length;
    const draftCampaigns = campaigns.filter((c) => c.status === "draft").length;
    const totalImpressions = campaigns.reduce((s, c) => s + (c.metrics?.impressions || 0), 0);
    const totalClicks = campaigns.reduce((s, c) => s + (c.metrics?.clicks || 0), 0);
    const totalConversions = campaigns.reduce((s, c) => s + (c.metrics?.conversions || 0), 0);
    const avgCTR = campaigns.length > 0
        ? (campaigns.reduce((s, c) => s + (c.metrics?.ctr || 0), 0) / campaigns.filter(c => c.metrics?.ctr).length || 0).toFixed(2)
        : "0";

    // Founder stats
    const activeMembers = team.filter((m) => m.status === "active").length;
    const completedMilestones = milestones.filter((m) => m.status === "completed").length;
    const inProgressMilestones = milestones.filter((m) => m.status === "in_progress").length;
    const milestoneProgress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

    const roleTitle: Record<string, string> = {
        developer: "Developer Analytics",
        marketer: "Campaign Analytics",
        founder: "Startup Analytics",
    };

    const roleSubtitle: Record<string, string> = {
        developer: "Overview of your projects and deployment metrics",
        marketer: "Performance metrics across all your campaigns",
        founder: "Team, roadmap, and project health overview",
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                        📊 {roleTitle[role] || "Analytics"}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {roleSubtitle[role] || "Overview of your metrics"}
                    </p>
                </div>

                {/* ── Onboarding Progress ── */}
                <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>
                        🎯 Onboarding Progress
                    </h3>
                    {user?.onboardingCompleted ? (
                        <p style={{ color: "var(--success)", fontSize: "1rem" }}>✅ Onboarding completed!</p>
                    ) : progress ? (
                        <div>
                            <div style={{ display: "flex", gap: 40, marginBottom: 20 }}>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Completion</p>
                                    <p style={{ color: "var(--accent-light)", fontSize: "2rem", fontWeight: 800 }}>{progress.percentage}%</p>
                                </div>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Steps Done</p>
                                    <p style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800 }}>{progress.completedSteps?.length || 0} / {progress.totalSteps || "?"}</p>
                                </div>
                            </div>
                            <div className="progress-track" style={{ height: 10 }}>
                                <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: "var(--text-muted)" }}>No progress data yet.</p>
                    )}
                </div>

                {/* ══════════════ DEVELOPER ANALYTICS ══════════════ */}
                {role === "developer" && (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Total Projects</p>
                                <p style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800 }}>{projects.length}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Deployed</p>
                                <p style={{ color: "var(--success)", fontSize: "2rem", fontWeight: 800 }}>{deployedCount}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>In Progress</p>
                                <p style={{ color: "var(--warning)", fontSize: "2rem", fontWeight: 800 }}>{createdCount}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Failed</p>
                                <p style={{ color: "var(--error)", fontSize: "2rem", fontWeight: 800 }}>{failedCount}</p>
                            </div>
                        </div>

                        {/* Recent Projects */}
                        <div className="glass-card" style={{ padding: 32 }}>
                            <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>🕐 Recent Projects</h3>
                            {projects.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {projects.slice(0, 5).map((p) => (
                                        <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.status === "deployed" ? "var(--success)" : p.status === "failed" ? "var(--error)" : "var(--warning)", flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>{p.name}</p>
                                                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{new Date(p.createdAt).toLocaleDateString()} · {p.status}</p>
                                            </div>
                                            <span className={`badge ${p.status === "deployed" ? "badge-green" : p.status === "failed" ? "badge-red" : "badge-yellow"}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "var(--text-muted)" }}>No projects yet.</p>
                            )}
                        </div>
                    </>
                )}

                {/* ══════════════ MARKETER ANALYTICS ══════════════ */}
                {role === "marketer" && (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Total Campaigns</p>
                                <p style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800 }}>{campaigns.length}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Live</p>
                                <p style={{ color: "var(--success)", fontSize: "2rem", fontWeight: 800 }}>{launchedCampaigns}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Drafts</p>
                                <p style={{ color: "var(--warning)", fontSize: "2rem", fontWeight: 800 }}>{draftCampaigns}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Avg CTR</p>
                                <p style={{ color: "var(--info)", fontSize: "2rem", fontWeight: 800 }}>{avgCTR}%</p>
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                            <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>📈 Aggregate Performance</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                                <div style={{ textAlign: "center", background: "var(--bg-surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border-subtle)" }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: 8 }}>Total Impressions</p>
                                    <p style={{ color: "var(--accent-light)", fontSize: "1.8rem", fontWeight: 800 }}>{totalImpressions.toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: "center", background: "var(--bg-surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border-subtle)" }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: 8 }}>Total Clicks</p>
                                    <p style={{ color: "var(--info)", fontSize: "1.8rem", fontWeight: 800 }}>{totalClicks.toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: "center", background: "var(--bg-surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border-subtle)" }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: 8 }}>Total Conversions</p>
                                    <p style={{ color: "var(--success)", fontSize: "1.8rem", fontWeight: 800 }}>{totalConversions.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Campaign breakdown */}
                        <div className="glass-card" style={{ padding: 32 }}>
                            <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 20 }}>📢 Campaign Breakdown</h3>
                            {campaigns.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {campaigns.slice(0, 8).map((c) => (
                                        <div key={c._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.status === "launched" ? "var(--success)" : "var(--warning)", flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>{c.name}</p>
                                                <p style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                                                    {c.goal?.replace("_", " ")} · {c.channel?.replace("_", " ")}
                                                    {c.metrics?.impressions > 0 && ` · ${c.metrics.impressions.toLocaleString()} impr`}
                                                </p>
                                            </div>
                                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                {c.metrics?.conversions > 0 && (
                                                    <span style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 700 }}>{c.metrics.conversions} conv</span>
                                                )}
                                                <span className={`badge ${c.status === "launched" ? "badge-green" : c.status === "paused" ? "badge-red" : "badge-yellow"}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: "var(--text-muted)" }}>No campaigns yet. Create one to start tracking.</p>
                            )}
                        </div>
                    </>
                )}

                {/* ══════════════ FOUNDER ANALYTICS ══════════════ */}
                {role === "founder" && (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Projects</p>
                                <p style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800 }}>{projects.length}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Team Size</p>
                                <p style={{ color: "var(--accent-light)", fontSize: "2rem", fontWeight: 800 }}>{team.length}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Active Members</p>
                                <p style={{ color: "var(--success)", fontSize: "2rem", fontWeight: 800 }}>{activeMembers}</p>
                            </div>
                            <div className="stat-card">
                                <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Milestones Done</p>
                                <p style={{ color: "var(--info)", fontSize: "2rem", fontWeight: 800 }}>{completedMilestones}/{milestones.length}</p>
                            </div>
                        </div>

                        {/* Roadmap progress */}
                        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                            <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 16 }}>🗺 Roadmap Progress</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{completedMilestones} of {milestones.length} milestones completed</span>
                                <span style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 700 }}>{milestoneProgress}%</span>
                            </div>
                            <div style={{ width: "100%", height: 10, borderRadius: 5, background: "var(--border)" }}>
                                <div style={{ width: `${milestoneProgress}%`, height: "100%", borderRadius: 5, background: "linear-gradient(90deg, var(--accent), var(--success))", transition: "width 0.5s ease" }} />
                            </div>
                            {milestones.length > 0 && (
                                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                                    {milestones.filter(m => m.status !== "completed").slice(0, 4).map((m) => (
                                        <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                            <span style={{ fontSize: "0.8rem" }}>{m.status === "in_progress" ? "🔧" : "📋"}</span>
                                            <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", flex: 1 }}>{m.title}</span>
                                            <span style={{ color: m.priority === "critical" ? "var(--error)" : m.priority === "high" ? "var(--warning)" : "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>{m.priority}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Team + Projects side by side */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="glass-card" style={{ padding: 32 }}>
                                <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 16 }}>👥 Team</h3>
                                {team.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {team.slice(0, 5).map((m) => (
                                            <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.15)", border: `2px solid ${m.status === "active" ? "var(--success)" : "var(--accent)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>
                                                    {m.name[0]?.toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 500 }}>{m.name}</p>
                                                    <p style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>{m.role}</p>
                                                </div>
                                                <span className={`badge ${m.status === "active" ? "badge-green" : "badge-yellow"}`} style={{ fontSize: "0.6rem" }}>
                                                    {m.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No team members yet.</p>
                                )}
                            </div>

                            <div className="glass-card" style={{ padding: 32 }}>
                                <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 16 }}>⚡ Projects</h3>
                                {projects.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {projects.slice(0, 5).map((p) => (
                                            <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.status === "deployed" ? "var(--success)" : "var(--warning)" }} />
                                                <span style={{ color: "var(--text-primary)", fontSize: "0.8rem", flex: 1 }}>{p.name}</span>
                                                <span className={`badge ${p.status === "deployed" ? "badge-green" : "badge-yellow"}`} style={{ fontSize: "0.6rem" }}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No projects yet.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
