const Flow = require("../models/Flow");
const Step = require("../models/Step");
const User = require("../models/User");

exports.getUserFlow = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.role) {
      return res.status(400).json({ error: "User profile incomplete" });
    }

    const flow = await Flow.findOne({ segment: user.role });

    if (!flow) {
      return res.status(404).json({ error: "No flow found" });
    }

    const steps = await Step.find({ flowId: flow._id }).sort("order");

    res.json({ flow, steps });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
