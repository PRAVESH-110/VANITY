const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    flowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
      required: true,
    },
    type: { type: String, required: true }, // info, form, action
    title: { type: String, required: true },
    order: { type: Number, required: true },
    completionCondition: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Step", stepSchema);
