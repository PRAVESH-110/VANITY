const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} = require("../controllers/milestoneController");

router.get("/", authMiddleware, getMilestones);
router.post("/", authMiddleware, createMilestone);
router.put("/:id", authMiddleware, updateMilestone);
router.delete("/:id", authMiddleware, deleteMilestone);

module.exports = router;
