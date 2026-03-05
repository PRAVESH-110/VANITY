const { Worker } = require("bullmq");
const connection = require("../utils/redisConnection");
const Project = require("../models/Project");
const DeploymentHistory = require("../models/DeploymentHistory");
const crypto = require("crypto");

new Worker(
  "deploymentQueue",
  async (job) => {
    const { projectId } = job.data;

    const project = await Project.findById(projectId);
    if (!project) return;

    // Stage 1
    project.status = "building";
    project.deploymentLogs.push("Building project...");
    await project.save();

    await new Promise((r) => setTimeout(r, 3000));

    // Stage 2
    project.status = "deploying";
    project.deploymentLogs.push("Deploying...");
    await project.save();

    await new Promise((r) => setTimeout(r, 3000));

    // Stage 3
    project.status = "deployed";
    project.deployKey = crypto.randomBytes(24).toString("hex");
    project.deploymentLogs.push("Deployment successful.");
    await project.save();

    // Save history
    await DeploymentHistory.create({
      projectId,
      status: "success",
      deployedAt: new Date(),
    });
  },
  { connection }
);
