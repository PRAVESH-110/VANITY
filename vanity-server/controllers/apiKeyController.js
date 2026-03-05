const ApiKey = require("../models/ApiKey");
const crypto = require("crypto");

exports.generateApiKey = async (req, res) => {
  try {
    // Check if already exists
    const existing = await ApiKey.findOne({ userId: req.user.id });
    if (existing) {
      return res.json(existing);
    }

    const key = crypto.randomBytes(24).toString("hex");

    const apiKey = await ApiKey.create({
      userId: req.user.id,
      key,
    });

    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate API key" });
  }
};

exports.getApiKey = async (req, res) => {
  const apiKey = await ApiKey.findOne({ userId: req.user.id });
  res.json(apiKey);
};
