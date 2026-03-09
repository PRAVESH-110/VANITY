import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { handleLogout } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ─── Load Projects ─── */
  const loadProjects = async () => {
    try {
      const res = await axios.get("/projects");
      setProjects(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => { loadProjects(); }, []);

  /* ─── Filter + Sort ─── */
  useEffect(() => {
    let temp = [...projects];
    if (search) temp = temp.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "all") temp = temp.filter((p) => p.status === filterStatus);
    if (sortOrder === "newest") temp.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else temp.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setFiltered(temp);
  }, [projects, search, filterStatus, sortOrder]);

  const isValidGitHubUrl = (url: string) => /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/.test(url);

  /* ─── Create Project ─── */
  const handleCreateProject = async () => {
    setError("");
    if (!name || !repoUrl) { setError("All fields are required."); return; }
    if (!isValidGitHubUrl(repoUrl)) { setError("Enter a valid GitHub URL: https://github.com/username/repo"); return; }
    setCreating(true);
    try {
      await axios.post("/projects", { name, repoUrl, environment: "development" });
      setName(""); setRepoUrl(""); setShowModal(false);
      loadProjects();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Project creation failed.");
    } finally {
      setCreating(false);
    }
  };

  /* ─── Delete Project ─── */
  const confirmDelete = async () => {
    if (!deleteId) return;
    await axios.delete(`/projects/${deleteId}`);
    setDeleteId(null);
    loadProjects();
  };

  const totalProjects = projects.length;
  const deployedCount = projects.filter((p) => p.status === "deployed").length;
  const createdCount = projects.filter((p) => p.status === "created").length;

  const getRoleEmoji = (role: string) => ({ developer: "🛠", founder: "🚀", marketer: "🎯" }[role] || "👤");

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: 32 }}>
          <span className="logo-text">VANITY</span>
        </div>

        <nav style={{ flex: 1 }}>
          <a href="#" className="nav-item active">
            <span>⚡</span> Projects
          </a>
          <a href="#" className="nav-item">
            <span>📊</span> Analytics
          </a>
          <a href="#" className="nav-item">
            <span>🔑</span> API Keys
          </a>
          <a href="#" className="nav-item">
            <span>⚙️</span> Settings
          </a>
        </nav>

        {/* User info */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", fontWeight: 700, color: "white",
            }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {getRoleEmoji(user?.role)} {user?.role || "user"}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            id="logout-btn"
            className="btn-secondary"
            style={{ width: "100%", padding: "8px 16px", fontSize: "0.8rem" }}
            onClick={handleLogout}
          >
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              Projects
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Manage and deploy your repositories
            </p>
          </div>
          <button
            id="new-project-btn"
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + New Project
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Total Projects
            </p>
            <p style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800 }}>{totalProjects}</p>
          </div>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Deployed
            </p>
            <p style={{ color: "var(--success)", fontSize: "2rem", fontWeight: 800 }}>{deployedCount}</p>
          </div>
          <div className="stat-card">
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              In Progress
            </p>
            <p style={{ color: "var(--warning)", fontSize: "2rem", fontWeight: 800 }}>{createdCount}</p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="🔍  Search projects..."
            className="input-field"
            style={{ maxWidth: 280 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select-field" style={{ maxWidth: 160 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="deployed">Deployed</option>
            <option value="created">Created</option>
          </select>
          <select className="select-field" style={{ maxWidth: 140 }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Project List */}
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📂</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>No projects yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Create your first project to get started</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((project) => (
              <div
                key={project._id}
                className="glass-card"
                style={{ padding: "20px 24px", borderRadius: 14 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link to={`/projects/${project._id}`} style={{ textDecoration: "none" }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 4, fontSize: "1rem" }}>
                      {project.name}
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{project.repoUrl}</p>
                  </Link>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className={`badge ${project.status === "deployed" ? "badge-green" : "badge-yellow"}`}>
                      {project.status === "deployed" ? "✓ Deployed" : "⏳ Created"}
                    </span>
                    <button
                      onClick={() => setDeleteId(project._id)}
                      style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", fontSize: "0.8rem", padding: "4px 8px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>
                Create New Project
              </h3>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Project Name</label>
                <input id="project-name" type="text" className="input-field" placeholder="My Awesome App" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">GitHub Repository URL</label>
                <input id="project-repo" type="text" className="input-field" placeholder="https://github.com/username/repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
              </div>
              {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn-secondary" onClick={() => { setShowModal(false); setError(""); }}>Cancel</button>
                <button id="project-create-btn" className="btn-primary" onClick={handleCreateProject} disabled={creating}>
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: 360, textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🗑️</div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>Delete Project?</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: 24 }}>
                This action cannot be undone. The project and all its data will be permanently removed.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn-primary" style={{ background: "var(--error)" }} onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
