const TeamMember = require("../models/TeamMember");

exports.getTeam = async (req, res) => {
  const members = await TeamMember.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(members);
};

exports.inviteMember = async (req, res) => {
  try {
    const { name, email, role, department } = req.body;

    const existing = await TeamMember.findOne({ userId: req.user.id, email });
    if (existing) {
      return res.status(400).json({ error: "This email is already on your team" });
    }

    const member = await TeamMember.create({
      userId: req.user.id,
      name,
      email,
      role: role || "developer",
      department: department || "",
    });

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to invite member" });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const member = await TeamMember.findOne({ _id: req.params.id, userId: req.user.id });
    if (!member) return res.status(404).json({ error: "Member not found" });

    const { name, email, role, department, status } = req.body;
    if (name) member.name = name;
    if (email) member.email = email;
    if (role) member.role = role;
    if (department !== undefined) member.department = department;
    if (status) {
      member.status = status;
      if (status === "active" && !member.joinedAt) member.joinedAt = new Date();
    }

    await member.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to update member" });
  }
};

exports.activateMember = async (req, res) => {
  try {
    const member = await TeamMember.findOne({ _id: req.params.id, userId: req.user.id });
    if (!member) return res.status(404).json({ error: "Member not found" });

    member.status = member.status === "active" ? "inactive" : "active";
    if (member.status === "active" && !member.joinedAt) member.joinedAt = new Date();
    await member.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to update member status" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const member = await TeamMember.findOne({ _id: req.params.id, userId: req.user.id });
    if (!member) return res.status(404).json({ error: "Member not found" });
    await TeamMember.deleteOne({ _id: req.params.id });
    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member" });
  }
};
