const Campaign = require("../models/Campaign");

/* ===============================
   CREATE CAMPAIGN
================================= */
exports.createCampaign = async (req, res) => {
  try {
    const { name, description, goal, channel, targetAudience, budget } = req.body;

    const campaign = await Campaign.create({
      userId: req.user.id,
      name,
      description: description || "",
      goal: goal || "user_activation",
      channel: channel || "email",
      targetAudience: targetAudience || "All users",
      budget: budget || 0,
    });

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

/* ===============================
   GET CAMPAIGNS
================================= */
exports.getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(campaigns);
};

/* ===============================
   LAUNCH CAMPAIGN
   Generates simulated metrics on launch
================================= */
exports.launchCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Generate realistic simulated metrics
    const impressions = Math.floor(Math.random() * 8000) + 2000;
    const clicks = Math.floor(impressions * (Math.random() * 0.15 + 0.03));
    const conversions = Math.floor(clicks * (Math.random() * 0.3 + 0.05));

    campaign.status = "launched";
    campaign.launchedAt = new Date();
    campaign.metrics = {
      impressions,
      clicks,
      conversions,
      ctr: parseFloat(((clicks / impressions) * 100).toFixed(2)),
      conversionRate: parseFloat(((conversions / clicks) * 100).toFixed(2)),
    };
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to launch campaign" });
  }
};

/* ===============================
   UPDATE CAMPAIGN
================================= */
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const { name, description, goal, channel, targetAudience, budget } = req.body;
    if (name) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (goal) campaign.goal = goal;
    if (channel) campaign.channel = channel;
    if (targetAudience !== undefined) campaign.targetAudience = targetAudience;
    if (budget !== undefined) campaign.budget = budget;

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to update campaign" });
  }
};

/* ===============================
   PAUSE CAMPAIGN
================================= */
exports.pauseCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    campaign.status = campaign.status === "paused" ? "launched" : "paused";
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to update campaign" });
  }
};

/* ===============================
   DELETE CAMPAIGN
================================= */
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await Campaign.deleteOne({ _id: req.params.id });
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete campaign" });
  }
};
