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
    description: {
      type: String,
      default: "",
    },
    goal: {
      type: String,
      enum: ["user_activation", "retention", "referral", "onboarding_completion", "feature_adoption"],
      default: "user_activation",
    },
    channel: {
      type: String,
      enum: ["email", "in_app", "push", "sms", "social"],
      default: "email",
    },
    targetAudience: {
      type: String,
      default: "All users",
    },
    budget: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "launched", "paused", "completed"],
      default: "draft",
    },
    // Simulated metrics (populated on launch)
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
    },
    launchedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
