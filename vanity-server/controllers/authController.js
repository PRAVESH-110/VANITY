const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || "developer",
      segment: (role || "developer").toLowerCase(),
    });

    res.json({
      success: true,
      message: "User registered successfully",
      data: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user without password
    const userData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      goal: user.goal,
      segment: user.segment,
      onboardingCompleted: user.onboardingCompleted,
    };

    res.json({
      success: true,
      message: "Login successful",
      data: { token, user: userData },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
