import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { io } from "socket.io-client";
import DeploymentTimeline from "../components/DeploymentTimeline";

interface Project {
  _id: string;
  name: string;
  status: "created" | "building" | "deploying" | "deployed" | "failed";
  repoUrl: string;
  environment: "development" | "staging" | "production";
  deployKey?: string;
  deploymentLogs: string[];
}

interface DeploymentHistory {
  _id: string;
  status: string;
  deployedAt: string;
  duration?: number;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<DeploymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  /* =========================
     FETCH PROJECT
  ========================== */
  const fetchProject = async () => {
    const res = await axios.get("/projects");
    const found = res.data.find((p: Project) => p._id === id);
    setProject(found || null);
    setLoading(false);
  };

  /* =========================
     FETCH DEPLOYMENT HISTORY
  ========================== */
  const fetchHistory = async () => {
    const res = await axios.get(`/projects/${id}/history`);
    setHistory(res.data);
  };

  /* =========================
     SOCKET REAL-TIME
  ========================== */
  useEffect(() => {
    fetchProject();
    fetchHistory();

    const socket = io("http://localhost:5000");

    socket.emit("joinProjectRoom", id);

    socket.on("deploymentUpdate", (updatedProject) => {
      setProject(updatedProject);
      setDeploying(false);
      fetchHistory();
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  /* =========================
     DEPLOY ACTION
  ========================== */
  const handleDeploy = async () => {
    if (!project) return;

    setDeploying(true);

    await axios.post("/projects/deploy", {
      projectId: project._id,
    });
  };

  /* =========================
     STATUS COLORS
  ========================== */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "deployed":
        return "badge badge-green";
      case "building":
      case "deploying":
        return "badge badge-yellow";
      case "failed":
        return "badge badge-yellow";
      default:
        return "badge badge-yellow";
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{ color: "var(--text-secondary)" }}>Project not found</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: 32 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: "var(--accent-light)",
          cursor: "pointer",
          fontSize: "0.9rem",
          marginBottom: 24,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}
      >
        ← Back
      </button>

      <div className="glass-card" style={{ padding: 32 }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ 
              fontSize: "1.8rem", 
              fontWeight: 800, 
              color: "var(--text-primary)", 
              marginBottom: 8 
            }}>
              {project.name}
            </h1>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent-light)",
                fontSize: "0.875rem",
                textDecoration: "none"
              }}
            >
              {project.repoUrl}
            </a>
          </div>

          <span className={getStatusBadge(project.status)}>
            {project.status}
          </span>
        </div>

        {/* DEPLOYMENT TIMELINE */}
        <DeploymentTimeline status={project.status} />

        {/* DEPLOY BUTTON */}
        <div style={{ marginTop: 32 }}>
          <button
            onClick={handleDeploy}
            disabled={deploying || project.status === "building" || project.status === "deploying"}
            className="btn-primary"
            style={{
              opacity: deploying ? 0.5 : 1,
              cursor: deploying ? "not-allowed" : "pointer"
            }}
          >
            {deploying ? "Deploying..." : "🚀 Deploy Project"}
          </button>
        </div>

        {/* DEPLOY KEY */}
        {project.deployKey && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ 
              fontWeight: 600, 
              color: "var(--text-primary)", 
              marginBottom: 12 
            }}>
              Deploy Key
            </h3>
            <div style={{ 
              background: "var(--bg-surface)", 
              border: "1px solid var(--border)",
              color: "#6ee7b7", 
              padding: 16, 
              borderRadius: 10, 
              fontFamily: "monospace", 
              fontSize: "0.85rem",
              overflow: "auto"
            }}>
              {project.deployKey}
            </div>
          </div>
        )}

        {/* DEPLOYMENT LOGS */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ 
            fontWeight: 600, 
            color: "var(--text-primary)", 
            marginBottom: 12 
          }}>
            Live Logs
          </h3>
          <div style={{ 
            background: "var(--bg-surface)", 
            border: "1px solid var(--border)",
            color: "#6ee7b7", 
            padding: 16, 
            borderRadius: 10, 
            fontFamily: "monospace", 
            fontSize: "0.85rem",
            maxHeight: 200,
            overflow: "auto"
          }}>
            {project.deploymentLogs?.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No logs yet.</p>
            ) : (
              project.deploymentLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* DEPLOYMENT HISTORY */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ 
            fontWeight: 600, 
            color: "var(--text-primary)", 
            marginBottom: 16 
          }}>
            Deployment History
          </h3>

          {history.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No previous deployments.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map((item) => (
                <div
                  key={item._id}
                  style={{ 
                    background: "var(--bg-surface)", 
                    border: "1px solid var(--border)",
                    padding: 16, 
                    borderRadius: 10, 
                    display: "flex", 
                    justifyContent: "space-between",
                    fontSize: "0.875rem"
                  }}
                >
                  <span style={{ color: "var(--text-primary)" }}>
                    {item.status === "deployed" ? "✓ Deployed" : "⏳ Failed"}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {new Date(item.deployedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

