const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCampaign,
  launchCampaign,
  getCampaigns,
} = require("../controllers/campaignController");

router.post("/", authMiddleware, createCampaign);
router.post("/launch", authMiddleware, launchCampaign);
router.get("/", authMiddleware, getCampaigns);

module.exports = router;
