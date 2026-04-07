import { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "invited" | "active" | "inactive";
  department: string;
  joinedAt: string | null;
  createdAt: string;
}

const ROLES = [
  { value: "co-founder", label: "👑 Co-Founder" },
  { value: "developer", label: "🛠 Developer" },
  { value: "designer", label: "🎨 Designer" },
  { value: "marketer", label: "🎯 Marketer" },
  { value: "operations", label: "📋 Operations" },
  { value: "advisor", label: "💡 Advisor" },
];

const roleLabel = (r: string) => ROLES.find((x) => x.value === r)?.label || r;
const roleEmoji = (r: string) => ({ "co-founder": "👑", developer: "🛠", designer: "🎨", marketer: "🎯", operations: "📋", advisor: "💡" }[r] || "👤");

const statusBadge = (s: string) => {
  switch (s) {
    case "active": return "badge badge-green";
    case "invited": return "badge badge-yellow";
    default: return "badge badge-red";
  }
};

export default function Team() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try { const res = await axios.get("/team"); setMembers(res.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setName(""); setEmail(""); setRole("developer"); setDepartment(""); setEditingId(null); setError(""); };

  const openEdit = (m: Member) => {
    setEditingId(m._id); setName(m.name); setEmail(m.email); setRole(m.role); setDepartment(m.department); setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true); setError("");
    try {
      if (editingId) {
        await axios.put(`/team/${editingId}`, { name, email, role, department });
      } else {
        await axios.post("/team", { name, email, role, department });
      }
      resetForm(); setShowModal(false); load();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save");
    }
    setSaving(false);
  };

  const handleToggle = async (id: string) => { await axios.post(`/team/${id}/toggle`); load(); };
  const handleRemove = async (id: string) => { await axios.delete(`/team/${id}`); load(); };

  const activeCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              👥 Team
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Manage your team and invite collaborators
            </p>
          </div>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            + Invite Member
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total Members</p>
            <p style={{ color: "var(--accent-light)", fontSize: "1.8rem", fontWeight: 800 }}>{members.length}</p>
          </div>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Active</p>
            <p style={{ color: "var(--success)", fontSize: "1.8rem", fontWeight: 800 }}>{activeCount}</p>
          </div>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Pending Invites</p>
            <p style={{ color: "var(--warning)", fontSize: "1.8rem", fontWeight: 800 }}>{invitedCount}</p>
          </div>
        </div>

        {/* Member List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : members.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>👥</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>No team members yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Invite your co-founders and collaborators to get started</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Invite Member</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {members.map((m) => (
              <div key={m._id} className="glass-card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: m.status === "active" ? "rgba(16,185,129,0.12)" : "rgba(124,58,237,0.12)",
                      border: `2px solid ${m.status === "active" ? "var(--success)" : "var(--accent)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem",
                    }}>
                      {roleEmoji(m.role)}
                    </div>
                    <div>
                      <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.95rem", marginBottom: 2 }}>
                        {m.name}
                      </h3>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{m.email}</span>
                        <span style={{ color: "var(--border)", fontSize: "0.75rem" }}>•</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{roleLabel(m.role)}</span>
                        {m.department && (
                          <>
                            <span style={{ color: "var(--border)", fontSize: "0.75rem" }}>•</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{m.department}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={statusBadge(m.status)}>
                      {m.status === "active" ? "✓ Active" : m.status === "invited" ? "✉ Invited" : "Inactive"}
                    </span>
                    <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.75rem" }} onClick={() => handleToggle(m._id)}>
                      {m.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.75rem" }} onClick={() => openEdit(m)}>
                      ✏️
                    </button>
                    <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.75rem", color: "var(--error)", borderColor: "rgba(239,68,68,0.3)" }} onClick={() => handleRemove(m._id)}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite / Edit Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: 480 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>
                {editingId ? "✏️ Edit Member" : "👥 Invite Team Member"}
              </h3>

              {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Name *</label>
                  <input className="input-field" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input className="input-field" type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label className="form-label">Role</label>
                  <select className="select-field" value={role} onChange={(e) => setRole(e.target.value)}>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <input className="input-field" placeholder="e.g., Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving || !name.trim() || !email.trim()}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
