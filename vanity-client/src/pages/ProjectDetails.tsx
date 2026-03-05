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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-100 text-green-800";
      case "building":
      case "deploying":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <a
              href={project.repoUrl}
              target="_blank"
              className="text-blue-600 text-sm"
            >
              {project.repoUrl}
            </a>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
        </div>

        {/* DEPLOYMENT TIMELINE */}
        <DeploymentTimeline status={project.status} />

        {/* DEPLOY BUTTON */}
        <div className="mt-8">
          <button
            onClick={handleDeploy}
            disabled={deploying || project.status === "building" || project.status === "deploying"}
            className={`px-6 py-3 rounded-lg text-white font-semibold ${
              deploying
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {deploying ? "Deploying..." : "🚀 Deploy Project"}
          </button>
        </div>

        {/* DEPLOY KEY */}
        {project.deployKey && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Deploy Key</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              {project.deployKey}
            </div>
          </div>
        )}

        {/* DEPLOYMENT LOGS */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Live Logs</h3>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
            {project.deploymentLogs?.length === 0 ? (
              <p>No logs yet.</p>
            ) : (
              project.deploymentLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* DEPLOYMENT HISTORY */}
        <div className="mt-10">
          <h3 className="font-semibold mb-4">Deployment History</h3>

          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No previous deployments.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-100 p-4 rounded flex justify-between text-sm"
                >
                  <span>{item.status}</span>
                  <span>
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
