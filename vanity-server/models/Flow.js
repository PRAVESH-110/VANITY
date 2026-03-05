const mongoose = require("mongoose");

const flowSchema = new mongoose.Schema(
  {
    segment: { type: String, required: true }, // developer
    activationGoal: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flow", flowSchema);
