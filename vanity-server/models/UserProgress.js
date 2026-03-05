const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
      required: true,
    },
    currentStep: { type: Number, default: 0 },
    completedSteps: [{ type: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProgress", progressSchema);
