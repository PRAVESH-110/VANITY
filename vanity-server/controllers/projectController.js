const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");

const {
  createProjectService,
  deployProjectService,
  checkDeploymentStatus,
} = require("../services/projectService");

/* ===============================
   CREATE PROJECT
================================= */
exports.createProject = asyncHandler(async (req, res) => {
  const project = await createProjectService(
    req.user.id,
    req.body
  );

  res.json(project);
});

/* ===============================
   GET PROJECTS
================================= */
exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    userId: req.user.id,
  }).sort({ createdAt: -1 });

  res.json(projects);
});

/* ===============================
   DELETE PROJECT
================================= */
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await Project.deleteOne({ _id: req.params.id });

  res.json({ message: "Project deleted successfully" });
});

/* ===============================
   DEPLOY PROJECT
================================= */
exports.deployProject = asyncHandler(async (req, res) => {
  const io = req.app.get("io");

  const result = await deployProjectService(
    req.user.id,
    req.body.projectId,
    io
  );

  res.json(result);
});

/* ===============================
   CHECK DEPLOYMENT STATUS
================================= */
exports.checkStatus = asyncHandler(async (req, res) => {
  const result = await checkDeploymentStatus(
    req.user.id,
    req.params.id
  );

  res.json(result);
});
