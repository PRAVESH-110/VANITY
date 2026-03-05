const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    repoUrl: {
      type: String,
      required: true,
    },

    environment: {
      type: String,
      enum: ["development", "staging", "production"],
      default: "development",
    },

    status: {
      type: String,
      enum: [
        "created",
        "building",
        "deploying",
        "deployed",
        "failed",
      ],
      default: "created",
    },

    deployKey: {
      type: String,
    },

    deploymentLogs: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
