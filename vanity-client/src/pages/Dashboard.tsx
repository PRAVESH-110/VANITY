import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [projects, setProjects] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* =============================
     LOAD PROJECTS
  ============================= */
  const loadProjects = async () => {
    const res = await axios.get("/projects");
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* =============================
     SEARCH + FILTER + SORT
  ============================= */
  useEffect(() => {
    let temp = [...projects];

    if (search) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      temp = temp.filter((p) => p.status === filterStatus);
    }

    if (sortOrder === "newest") {
      temp.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    } else {
      temp.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
    }

    setFiltered(temp);
  }, [projects, search, filterStatus, sortOrder]);

  /* =============================
     VALIDATION
  ============================= */
  const isValidGitHubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
    return githubRegex.test(url);
  };

  /* =============================
     CREATE PROJECT
  ============================= */
  const handleCreateProject = async () => {
    setError("");

    if (!name || !repoUrl) {
      setError("All fields are required.");
      return;
    }

    if (!isValidGitHubUrl(repoUrl)) {
      setError("Invalid GitHub repository URL.");
      return;
    }

    try {
      await axios.post("/projects", {
        name,
        repoUrl,
        environment: "development",
      });

      setName("");
      setRepoUrl("");
      setShowModal(false);
      loadProjects();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Project creation failed."
      );
    }
  };

  /* =============================
     DELETE PROJECT
  ============================= */
  const confirmDelete = async () => {
    if (!deleteId) return;

    await axios.delete(`/projects/${deleteId}`);
    setDeleteId(null);
    loadProjects();
  };

  /* =============================
     ANALYTICS
  ============================= */
  const totalProjects = projects.length;
  const deployedCount = projects.filter(
    (p) => p.status === "deployed"
  ).length;
  const createdCount = projects.filter(
    (p) => p.status === "created"
  ).length;

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Projects
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome, {user.email}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            + New Project
          </button>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-5 py-2 rounded"
          >
            Logout
          </button>
        </div>

      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-gray-500">
            Total Projects
          </p>
          <h2 className="text-2xl font-bold">
            {totalProjects}
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-gray-500">
            Deployed
          </p>
          <h2 className="text-2xl font-bold text-green-600">
            {deployedCount}
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p className="text-sm text-gray-500">
            Created
          </p>
          <h2 className="text-2xl font-bold text-yellow-600">
            {createdCount}
          </h2>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          className="border p-2 rounded w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="deployed">Deployed</option>
          <option value="created">Created</option>
        </select>

        <select
          className="border p-2 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* PROJECT LIST */}
      {filtered.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-gray-600">
          No projects found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded shadow hover:shadow-lg transition border"
            >
              <div className="flex justify-between items-center">

                <Link to={`/projects/${project._id}`}>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {project.repoUrl}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-4">

                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      project.status === "deployed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {project.status}
                  </span>

                  <button
                    onClick={() => setDeleteId(project._id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">

            <h3 className="text-xl font-semibold mb-4">
              Create New Project
            </h3>

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
              className="border p-3 w-full mb-3 rounded"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />

            {error && (
              <p className="text-red-500 text-sm mb-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                onClick={handleCreateProject}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>

          </div>

        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">

          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Delete
            </h3>

            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
