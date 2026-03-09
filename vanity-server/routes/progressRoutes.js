const express = require("express");
const router = express.Router();
const {
  getProgress,
  completeStep,
  completeOnboarding,
} = require("../controllers/progressController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getProgress);
router.post("/complete", authMiddleware, completeStep);
router.post("/complete-onboarding", authMiddleware, completeOnboarding);

module.exports = router;
