const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["draft", "launched"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
