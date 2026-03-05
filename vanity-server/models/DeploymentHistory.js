const mongoose = require("mongoose");

const deploymentHistorySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },

    branch: {
      type: String,
    },

    commitMessage: {
      type: String,
    },

    commitSha: {
      type: String,
    },

    triggeredBy: {
      type: String,
      enum: ["manual", "webhook"],
      default: "manual",
    },

    environment: {
      type: String,
      enum: ["development", "staging", "production"],
    },

    duration: {
      type: Number, // in milliseconds
    },

    deployKey: {
      type: String,
    },

    logsSnapshot: {
      type: [String],
      default: [],
    },

    deployedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DeploymentHistory",
  deploymentHistorySchema
);
