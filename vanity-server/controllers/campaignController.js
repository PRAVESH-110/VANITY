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

exports.getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({ userId: req.user.id });
  res.json(campaigns);
};

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

    campaign.status = "launched";
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to launch campaign" });
  }
};
