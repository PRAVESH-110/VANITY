const Milestone = require("../models/Milestone");

exports.getMilestones = async (req, res) => {
  const milestones = await Milestone.find({ userId: req.user.id }).sort({ dueDate: 1, createdAt: -1 });
  res.json(milestones);
};

exports.createMilestone = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const milestone = await Milestone.create({
      userId: req.user.id,
      title,
      description: description || "",
      priority: priority || "medium",
      dueDate: dueDate || null,
    });
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: "Failed to create milestone" });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const ms = await Milestone.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ms) return res.status(404).json({ error: "Milestone not found" });

    const { title, description, priority, status, dueDate } = req.body;
    if (title) ms.title = title;
    if (description !== undefined) ms.description = description;
    if (priority) ms.priority = priority;
    if (dueDate !== undefined) ms.dueDate = dueDate;
    if (status) {
      ms.status = status;
      if (status === "completed") ms.completedAt = new Date();
      else ms.completedAt = null;
    }

    await ms.save();
    res.json(ms);
  } catch (error) {
    res.status(500).json({ error: "Failed to update milestone" });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    const ms = await Milestone.findOne({ _id: req.params.id, userId: req.user.id });
    if (!ms) return res.status(404).json({ error: "Milestone not found" });
    await Milestone.deleteOne({ _id: req.params.id });
    res.json({ message: "Milestone deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete milestone" });
  }
};
