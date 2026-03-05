const Project = require("../models/Project");
const crypto = require("crypto");
const axios = require("axios");

const validateGitHubRepo = async (repoUrl) => {
  const match = repoUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/
  );

  if (!match) {
    throw new Error("Invalid GitHub URL format");
  }

  const owner = match[1];
  const repo = match[2];

  try {
    await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
  } catch (err) {
    throw new Error("GitHub repository not found");
  }
};

/* ===============================
   CREATE PROJECT
================================= */
exports.createProjectService = async (userId, data) => {
  const { name, repoUrl, environment } = data;

  const existing = await Project.findOne({
    userId,
    repoUrl,
  });

  if (existing) {
    throw new Error("Project with this repository already exists");
  }

  // ✅ REAL GITHUB VALIDATION HERE
  await validateGitHubRepo(repoUrl);

  const project = await Project.create({
    userId,
    name,
    repoUrl,
    environment,
    status: "created",
  });

  return project;
};

/* ===============================
   DEPLOY PROJECT
================================= */
exports.deployProjectService = async (userId, projectId, io) => {
  const project = await Project.findOne({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (
    project.status === "building" ||
    project.status === "deploying"
  ) {
    throw new Error("Deployment already in progress");
  }

  // Stage 1
  project.status = "building";
  project.deploymentLogs = ["Starting build process..."];
  await project.save();

  io.to(projectId).emit("deploymentUpdate", project);

  // Stage 2
  setTimeout(async () => {
    const p = await Project.findById(projectId);
    if (!p) return;

    p.status = "deploying";
    p.deploymentLogs.push("Build successful. Deploying...");
    await p.save();

    io.to(projectId).emit("deploymentUpdate", p);
  }, 3000);

  // Stage 3
  setTimeout(async () => {
    const p = await Project.findById(projectId);
    if (!p) return;

    p.status = "deployed";
    p.deployKey = crypto.randomBytes(24).toString("hex");
    p.deploymentLogs.push("Deployment completed successfully.");
    await p.save();

    io.to(projectId).emit("deploymentUpdate", p);
  }, 6000);

  return { message: "Deployment started" };
};
