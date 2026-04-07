const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Project = require("../models/Project");
const DeploymentHistory = require("../models/DeploymentHistory");

const {
  createProject,
  getProjects,
  deleteProject,
  deployProject,
  checkStatus,
} = require("../controllers/projectController");

/* ========================= */
router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.delete("/:id", authMiddleware, deleteProject);
router.post("/deploy", authMiddleware, deployProject);
router.get("/:id/check-status", authMiddleware, checkStatus);

/* =========================
   GET DEPLOYMENT HISTORY
========================= */
router.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const history = await DeploymentHistory.find({
      projectId: req.params.id,
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;
