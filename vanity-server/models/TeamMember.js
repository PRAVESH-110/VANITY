const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["co-founder", "developer", "designer", "marketer", "operations", "advisor"],
      default: "developer",
    },
    status: {
      type: String,
      enum: ["invited", "active", "inactive"],
      default: "invited",
    },
    department: {
      type: String,
      default: "",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
