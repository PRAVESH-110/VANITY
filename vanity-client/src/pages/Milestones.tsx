import { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";

interface Milestone {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "planned" | "in_progress" | "completed";
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

const PRIORITIES = [
  { value: "low", label: "Low", color: "var(--text-muted)" },
  { value: "medium", label: "Medium", color: "var(--info)" },
  { value: "high", label: "High", color: "var(--warning)" },
  { value: "critical", label: "Critical", color: "var(--error)" },
];

const priColor = (p: string) => PRIORITIES.find((x) => x.value === p)?.color || "var(--text-muted)";
const priLabel = (p: string) => PRIORITIES.find((x) => x.value === p)?.label || p;

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  planned: { bg: "rgba(136,136,170,0.1)", color: "var(--text-muted)", label: "📋 Planned" },
  in_progress: { bg: "rgba(59,130,246,0.1)", color: "var(--info)", label: "🔧 In Progress" },
  completed: { bg: "rgba(16,185,129,0.1)", color: "var(--success)", label: "✅ Completed" },
};

export default function Milestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await axios.get("/milestones"); setMilestones(res.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setTitle(""); setDescription(""); setPriority("medium"); setDueDate(""); setEditingId(null); };

  const openEdit = (m: Milestone) => {
    setEditingId(m._id); setTitle(m.title); setDescription(m.description);
    setPriority(m.priority); setDueDate(m.dueDate ? m.dueDate.substring(0, 10) : "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = { title, description, priority, dueDate: dueDate || null };
      if (editingId) await axios.put(`/milestones/${editingId}`, data);
      else await axios.post("/milestones", data);
      resetForm(); setShowModal(false); load();
    } catch {}
    setSaving(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await axios.put(`/milestones/${id}`, { status });
    load();
  };

  const handleDelete = async (id: string) => { await axios.delete(`/milestones/${id}`); load(); };

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const inProgressCount = milestones.filter((m) => m.status === "in_progress").length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const isOverdue = (m: Milestone) => m.dueDate && m.status !== "completed" && new Date(m.dueDate) < new Date();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              🗺 Roadmap
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Track your startup milestones and progress
            </p>
          </div>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            + Add Milestone
          </button>
        </div>

        {/* Stats + Progress bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total</p>
            <p style={{ color: "var(--accent-light)", fontSize: "1.8rem", fontWeight: 800 }}>{milestones.length}</p>
          </div>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>In Progress</p>
            <p style={{ color: "var(--info)", fontSize: "1.8rem", fontWeight: 800 }}>{inProgressCount}</p>
          </div>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Completed</p>
            <p style={{ color: "var(--success)", fontSize: "1.8rem", fontWeight: 800 }}>{completedCount}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32, background: "var(--bg-surface)", borderRadius: 10, border: "1px solid var(--border)", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600 }}>Overall Progress</span>
            <span style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ width: "100%", height: 8, borderRadius: 4, background: "var(--border)" }}>
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg, var(--accent), var(--success))", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Milestone List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : milestones.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🗺</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>No milestones yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Plan your roadmap — add key milestones to track progress</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Milestone</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {milestones.map((m) => {
              const st = statusStyles[m.status] || statusStyles.planned;
              const overdue = isOverdue(m);
              return (
                <div key={m._id} className="glass-card" style={{ padding: "20px 24px", borderLeft: `3px solid ${overdue ? "var(--error)" : st.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <h3 style={{ color: m.status === "completed" ? "var(--text-muted)" : "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem", textDecoration: m.status === "completed" ? "line-through" : "none" }}>
                          {m.title}
                        </h3>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: priColor(m.priority), textTransform: "uppercase", letterSpacing: "0.05em", background: `${priColor(m.priority)}15`, padding: "2px 8px", borderRadius: 4 }}>
                          {priLabel(m.priority)}
                        </span>
                        {overdue && (
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--error)", textTransform: "uppercase", background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                            Overdue
                          </span>
                        )}
                      </div>
                      {m.description && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: 8, lineHeight: 1.5 }}>{m.description}</p>
                      )}
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        {m.dueDate && (
                          <span style={{ color: overdue ? "var(--error)" : "var(--text-muted)", fontSize: "0.72rem" }}>
                            📅 Due: {new Date(m.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {m.completedAt && (
                          <span style={{ color: "var(--success)", fontSize: "0.72rem" }}>
                            ✅ Done: {new Date(m.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {/* Status dropdown */}
                      <select
                        value={m.status}
                        onChange={(e) => handleStatusChange(m._id, e.target.value)}
                        style={{
                          background: st.bg, color: st.color, border: `1px solid ${st.color}30`,
                          borderRadius: 8, padding: "6px 12px", fontSize: "0.72rem", fontWeight: 600,
                          cursor: "pointer", outline: "none", appearance: "none", textAlign: "center",
                          minWidth: 110,
                        }}
                      >
                        <option value="planned">📋 Planned</option>
                        <option value="in_progress">🔧 In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => openEdit(m)}>✏️</button>
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem", color: "var(--error)", borderColor: "rgba(239,68,68,0.3)" }} onClick={() => handleDelete(m._id)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: 480 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>
                {editingId ? "✏️ Edit Milestone" : "🗺 Add Milestone"}
              </h3>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Title *</label>
                <input className="input-field" placeholder="e.g., MVP Launch" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Description</label>
                <textarea className="input-field" placeholder="Details about this milestone..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ resize: "vertical", minHeight: 70 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label className="form-label">Priority</label>
                  <select className="select-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Due Date</label>
                  <input type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving || !title.trim()}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Milestone"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
