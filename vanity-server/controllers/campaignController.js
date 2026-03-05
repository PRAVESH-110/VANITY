const Campaign = require("../models/Campaign");

exports.createCampaign = async (req, res) => {
  try {
    const { name } = req.body;

    const campaign = await Campaign.create({
      userId: req.user.id,
      name,
    });

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

exports.launchCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      userId: req.user.id,
    });

    if (!campaign) {
      return res.status(404).json({ error: "No campaign found" });
    }

    campaign.status = "launched";
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to launch campaign" });
  }
};

exports.getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ userId: req.user.id });
  res.json(campaigns);
};
