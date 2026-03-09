const UserProgress = require("../models/UserProgress");
const User = require("../models/User");
const Step = require("../models/Step");

/**
 * GET /api/progress
 * Returns current user progress with percentage
 */
exports.getProgress = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user.id });

    if (!progress) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const totalSteps = await Step.countDocuments({ flowId: progress.flowId });
    const completedCount = progress.completedSteps.length;
    const percentage =
      totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...progress.toObject(),
        totalSteps,
        percentage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/progress/complete
 * Mark a step as complete, update currentStep
 */
exports.completeStep = async (req, res) => {
  try {
    const { stepNumber, flowId } = req.body;

    let progress = await UserProgress.findOne({ userId: req.user.id });

    if (!progress) {
      progress = await UserProgress.create({
        userId: req.user.id,
        flowId,
        currentStep: stepNumber,
        completedSteps: [stepNumber],
      });
    } else {
      if (!progress.completedSteps.includes(stepNumber)) {
        progress.completedSteps.push(stepNumber);
      }
      progress.currentStep = stepNumber;
      await progress.save();
    }

    // Check if all steps are done
    const totalSteps = await Step.countDocuments({ flowId });
    if (stepNumber >= totalSteps) {
      await User.findByIdAndUpdate(req.user.id, {
        onboardingCompleted: true,
      });
    }

    const percentage =
      totalSteps > 0
        ? Math.round((progress.completedSteps.length / totalSteps) * 100)
        : 0;

    res.json({
      success: true,
      data: { ...progress.toObject(), totalSteps, percentage },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/progress/complete-onboarding
 * Explicitly mark onboarding as finished
 */
exports.completeOnboarding = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });
    res.json({ success: true, message: "Onboarding completed!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
