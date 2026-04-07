import { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";

interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
}

interface Campaign {
  _id: string;
  name: string;
  description: string;
  goal: string;
  channel: string;
  targetAudience: string;
  budget: number;
  status: "draft" | "launched" | "paused" | "completed";
  metrics: CampaignMetrics;
  launchedAt: string | null;
  createdAt: string;
}

const GOALS = [
  { value: "user_activation", label: "🎯 User Activation" },
  { value: "retention", label: "🔁 Retention" },
  { value: "referral", label: "📣 Referral" },
  { value: "onboarding_completion", label: "✅ Onboarding Completion" },
  { value: "feature_adoption", label: "🧪 Feature Adoption" },
];

const CHANNELS = [
  { value: "email", label: "📧 Email" },
  { value: "in_app", label: "📱 In-App" },
  { value: "push", label: "🔔 Push" },
  { value: "sms", label: "💬 SMS" },
  { value: "social", label: "🌐 Social" },
];

const goalLabel = (g: string) => GOALS.find((x) => x.value === g)?.label || g;
const channelLabel = (c: string) => CHANNELS.find((x) => x.value === c)?.label || c;

const statusBadge = (s: string) => {
  switch (s) {
    case "launched": return "badge badge-green";
    case "paused": return "badge badge-yellow";
    case "completed": return "badge badge-green";
    default: return "badge badge-yellow";
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case "launched": return "✓ Live";
    case "paused": return "⏸ Paused";
    case "completed": return "✓ Completed";
    default: return "⏳ Draft";
  }
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("user_activation");
  const [channel, setChannel] = useState("email");
  const [targetAudience, setTargetAudience] = useState("All users");
  const [budget, setBudget] = useState(0);
  const [creating, setCreating] = useState(false);

  const loadCampaigns = async () => {
    try {
      const res = await axios.get("/campaigns");
      setCampaigns(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadCampaigns(); }, []);

  const resetForm = () => {
    setName(""); setDescription(""); setGoal("user_activation");
    setChannel("email"); setTargetAudience("All users"); setBudget(0);
    setEditingId(null);
  };

  const openEdit = (c: Campaign) => {
    setEditingId(c._id);
    setName(c.name);
    setDescription(c.description || "");
    setGoal(c.goal);
    setChannel(c.channel);
    setTargetAudience(c.targetAudience);
    setBudget(c.budget);
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await axios.post("/campaigns", { name, description, goal, channel, targetAudience, budget });
      resetForm();
      setShowModal(false);
      loadCampaigns();
    } catch {}
    setCreating(false);
  };

  const handleUpdate = async () => {
    if (!name.trim() || !editingId) return;
    setCreating(true);
    try {
      await axios.put(`/campaigns/${editingId}`, { name, description, goal, channel, targetAudience, budget });
      resetForm();
      setShowModal(false);
      loadCampaigns();
    } catch {}
    setCreating(false);
  };

  const handleLaunch = async (id: string) => {
    await axios.post(`/campaigns/${id}/launch`);
    loadCampaigns();
  };

  const handlePause = async (id: string) => {
    await axios.post(`/campaigns/${id}/pause`);
    loadCampaigns();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/campaigns/${id}`);
    loadCampaigns();
  };

  const launchedCount = campaigns.filter((c) => c.status === "launched").length;
  const draftCount = campaigns.filter((c) => c.status === "draft").length;
  const totalImpressions = campaigns.reduce((s, c) => s + (c.metrics?.impressions || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.metrics?.conversions || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              📢 Campaigns
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Create, launch, and track your activation campaigns
            </p>
          </div>
          <button id="new-campaign-btn" className="btn-primary" onClick={() => setShowModal(true)}>
            + New Campaign
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total", value: campaigns.length, color: "var(--accent-light)" },
            { label: "Live", value: launchedCount, color: "var(--success)" },
            { label: "Drafts", value: draftCount, color: "var(--warning)" },
            { label: "Conversions", value: totalConversions.toLocaleString(), color: "var(--info)" },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                {s.label}
              </p>
              <p style={{ color: s.color, fontSize: "1.8rem", fontWeight: 800 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Campaign List ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📢</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>No campaigns yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Create your first campaign to start tracking user activation</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Campaign</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {campaigns.map((c) => {
              const isExpanded = expandedId === c._id;
              return (
                <div key={c._id} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                  {/* Header row */}
                  <div
                    style={{ padding: "20px 24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => setExpandedId(isExpanded ? null : c._id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: c.status === "launched" ? "rgba(16,185,129,0.12)" : "rgba(124,58,237,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem",
                      }}>
                        {c.channel === "email" ? "📧" : c.channel === "in_app" ? "📱" : c.channel === "push" ? "🔔" : c.channel === "sms" ? "💬" : "🌐"}
                      </div>
                      <div>
                        <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>
                          {c.name}
                        </h3>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{goalLabel(c.goal)}</span>
                          <span style={{ color: "var(--border)", fontSize: "0.75rem" }}>•</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{channelLabel(c.channel)}</span>
                          {c.budget > 0 && (
                            <>
                              <span style={{ color: "var(--border)", fontSize: "0.75rem" }}>•</span>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>${c.budget.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Mini metrics for launched campaigns */}
                      {c.status === "launched" && c.metrics && (
                        <div style={{ display: "flex", gap: 16, marginRight: 12 }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.6rem", textTransform: "uppercase" }}>CTR</p>
                            <p style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: 700 }}>{c.metrics.ctr}%</p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.6rem", textTransform: "uppercase" }}>Conv</p>
                            <p style={{ color: "var(--info)", fontSize: "0.85rem", fontWeight: 700 }}>{c.metrics.conversions}</p>
                          </div>
                        </div>
                      )}

                      <span className={statusBadge(c.status)}>{statusLabel(c.status)}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{
                      borderTop: "1px solid var(--border)",
                      padding: "20px 24px",
                      animation: "fadeIn 0.2s ease",
                    }}>
                      {/* Description */}
                      {c.description && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 20, lineHeight: 1.6 }}>
                          {c.description}
                        </p>
                      )}

                      {/* Detail grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
                        <div>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: 4 }}>Goal</p>
                          <p style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>{goalLabel(c.goal)}</p>
                        </div>
                        <div>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: 4 }}>Channel</p>
                          <p style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>{channelLabel(c.channel)}</p>
                        </div>
                        <div>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: 4 }}>Audience</p>
                          <p style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>{c.targetAudience}</p>
                        </div>
                        <div>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", marginBottom: 4 }}>Budget</p>
                          <p style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>{c.budget > 0 ? `$${c.budget.toLocaleString()}` : "—"}</p>
                        </div>
                      </div>

                      {/* Metrics (only for launched) */}
                      {c.metrics && c.metrics.impressions > 0 && (
                        <div style={{ background: "var(--bg-surface)", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid var(--border-subtle)" }}>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                            📊 Performance Metrics
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
                            {[
                              { label: "Impressions", value: c.metrics.impressions.toLocaleString(), color: "var(--text-primary)" },
                              { label: "Clicks", value: c.metrics.clicks.toLocaleString(), color: "var(--accent-light)" },
                              { label: "Conversions", value: c.metrics.conversions.toLocaleString(), color: "var(--success)" },
                              { label: "CTR", value: `${c.metrics.ctr}%`, color: "var(--warning)" },
                              { label: "Conv. Rate", value: `${c.metrics.conversionRate}%`, color: "var(--info)" },
                            ].map((m) => (
                              <div key={m.label} style={{ textAlign: "center" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</p>
                                <p style={{ color: m.color, fontSize: "1.2rem", fontWeight: 800 }}>{m.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                          Created: {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                        {c.launchedAt && (
                          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                            Launched: {new Date(c.launchedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 10 }}>
                        {c.status === "draft" && (
                          <button className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.8rem" }} onClick={() => handleLaunch(c._id)}>
                            🚀 Launch Campaign
                          </button>
                        )}
                        {c.status === "launched" && (
                          <button className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.8rem" }} onClick={() => handlePause(c._id)}>
                            ⏸ Pause
                          </button>
                        )}
                        {c.status === "paused" && (
                          <button className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.8rem" }} onClick={() => handlePause(c._id)}>
                            ▶ Resume
                          </button>
                        )}
                        <button
                          className="btn-secondary"
                          style={{ padding: "8px 20px", fontSize: "0.8rem" }}
                          onClick={() => openEdit(c)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: "8px 20px", fontSize: "0.8rem", color: "var(--error)", borderColor: "rgba(239,68,68,0.3)" }}
                          onClick={() => handleDelete(c._id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Create Modal ── */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: 520 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>
                {editingId ? "✏️ Edit Campaign" : "🎯 Create New Campaign"}
              </h3>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Campaign Name *</label>
                <input
                  id="campaign-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g., Q1 User Activation Drive"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="input-field"
                  placeholder="What's the purpose of this campaign?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ resize: "vertical", minHeight: 70 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Goal</label>
                  <select className="select-field" value={goal} onChange={(e) => setGoal(e.target.value)}>
                    {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Channel</label>
                  <select className="select-field" value={channel} onChange={(e) => setChannel(e.target.value)}>
                    {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label className="form-label">Target Audience</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., New signups, Free tier"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Budget ($)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0"
                    value={budget || ""}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button
                  id="campaign-create-btn"
                  className="btn-primary"
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={creating || !name.trim()}
                >
                  {creating ? "Saving..." : editingId ? "Save Changes" : "Create Campaign"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
