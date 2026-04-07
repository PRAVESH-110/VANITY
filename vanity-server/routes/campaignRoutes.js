const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCampaign,
  launchCampaign,
  getCampaigns,
  pauseCampaign,
  deleteCampaign,
  updateCampaign,
} = require("../controllers/campaignController");

router.post("/", authMiddleware, createCampaign);
router.get("/", authMiddleware, getCampaigns);
router.put("/:id", authMiddleware, updateCampaign);
router.post("/:id/launch", authMiddleware, launchCampaign);
router.post("/:id/pause", authMiddleware, pauseCampaign);
router.delete("/:id", authMiddleware, deleteCampaign);

module.exports = router;
