const UserProgress = require("../models/UserProgress");
const User = require("../models/User");

exports.getProgress = async (req, res) => {
  const progress = await UserProgress.findOne({ userId: req.user.id });
  res.json(progress);
};

exports.completeStep = async (req, res) => {
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

  // 🔥 CHECK IF FINISHED
  const totalSteps = await require("../models/Step").countDocuments({
    flowId,
  });

  if (stepNumber >= totalSteps) {
    await User.findByIdAndUpdate(req.user.id, {
      onboardingCompleted: true,
    });
  }

  res.json(progress);
};
