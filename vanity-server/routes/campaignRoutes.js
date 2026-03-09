const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCampaign,
  launchCampaign,
  getCampaigns,
} = require("../controllers/campaignController");

router.post("/", authMiddleware, createCampaign);
router.get("/", authMiddleware, getCampaigns);
router.post("/:id/launch", authMiddleware, launchCampaign);

module.exports = router;
