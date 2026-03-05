import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

interface StepProps {
  step: any;
  next: () => void;
}

export default function StepRenderer({ step, next }: StepProps) {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidGitHubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
    return githubRegex.test(url);
  };

  const handleStep = async () => {
    setLoading(true);
    setMessage("");

    try {
      // ==============================
      // STEP 1 → CREATE PROJECT
      // ==============================
      if (user.role === "developer" && step.order === 1) {
        if (!name || !repoUrl) {
          setMessage("Please enter project name and GitHub URL.");
          setLoading(false);
          return;
        }

        if (!isValidGitHubUrl(repoUrl)) {
          setMessage("Please enter a valid GitHub repository URL.");
          setLoading(false);
          return;
        }

        await axios.post("/projects", {
          name,
          repoUrl,
          environment: "development",
        });

        setMessage("Project created successfully ✅");
        next();
      }

      // ==============================
      // STEP 2 → GENERATE DEPLOY KEY
      // ==============================
      if (user.role === "developer" && step.order === 2) {
        // Get latest project automatically
        const projectsRes = await axios.get("/projects");
        const projects = projectsRes.data;

        if (!projects.length) {
          setMessage("No project found. Please create one first.");
          setLoading(false);
          return;
        }

        const latestProject = projects[projects.length - 1];

        const res = await axios.post("/projects/deploy", {
          projectId: latestProject._id,
        });

        setMessage(`Deploy Key Generated 🔑`);
        next();
      }

      // ==============================
      // STEP 3 → COMPLETE
      // ==============================
      if (user.role === "developer" && step.order === 3) {
        setMessage("Setup complete 🚀");
        next();
      }

    } catch (error: any) {
      setMessage(
        error?.response?.data?.error || "Something went wrong."
      );
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-xl">

      <h3 className="text-2xl font-semibold mb-6">
        {step.title}
      </h3>

      {/* STEP 1 INPUTS */}
      {user.role === "developer" && step.order === 1 && (
        <>
          <input
            type="text"
            placeholder="Project Name"
            className="border p-3 w-full mb-3 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="https://github.com/username/repo"
            className="border p-3 w-full mb-4 rounded"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </>
      )}

      {/* MESSAGE */}
      {message && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4 text-sm">
          {message}
        </div>
      )}

      {/* ACTION BUTTON */}
      <button
        onClick={handleStep}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Processing..." : "Continue"}
      </button>

    </div>
  );
}
