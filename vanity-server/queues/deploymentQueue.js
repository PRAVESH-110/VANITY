const { Queue } = require("bullmq");
const connection = require("../utils/redisConnection");

const deploymentQueue = require("../queues/deploymentQueue");

exports.deployProjectService = async (userId, projectId) => {
  const project = await Project.findOne({
    _id: projectId,
    userId,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.status === "building" || project.status === "deploying") {
    throw new Error("Deployment already in progress");
  }

  await deploymentQueue.add("deployJob", { projectId });

  return { message: "Deployment queued" };
};

module.exports = deploymentQueue;
