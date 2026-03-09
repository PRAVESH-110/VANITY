const Flow = require("../models/Flow");
const Step = require("../models/Step");
const User = require("../models/User");

/**
 * GET /api/flow/my-flow
 * Fetch the onboarding flow assigned to the current user based on their segment/role
 */
exports.getUserFlow = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.role) {
      return res.status(400).json({
        success: false,
        message: "User profile incomplete. Please set your role first.",
      });
    }

    // Use segment if set; fall back to role
    const segment = user.segment || user.role;

    const flow = await Flow.findOne({ segment });

    if (!flow) {
      return res.status(404).json({
        success: false,
        message: `No onboarding flow found for segment: ${segment}`,
      });
    }

    const steps = await Step.find({ flowId: flow._id }).sort("order");

    res.json({
      success: true,
      data: { flow, steps },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
