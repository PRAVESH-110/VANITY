const express = require("express");
const router = express.Router();
const {
  getProgress,
  completeStep,
} = require("../controllers/progressController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getProgress);
router.post("/complete", authMiddleware, completeStep);

module.exports = router;
