const User = require("../models/User");

/**
 * POST /api/user/profile
 * Update user role + goal → derive segment → used to pick onboarding flow
 */
exports.updateProfile = async (req, res) => {
    try {
        const { role, goal } = req.body;

        if (!role || !goal) {
            return res.status(400).json({
                success: false,
                message: "role and goal are required",
            });
        }

        // Simple segment derivation: segment = role (developer / founder / marketer)
        const segment = role.toLowerCase();

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { role, goal, segment },
            { new: true, select: "-password" }
        );

        res.json({
            success: true,
            message: "Profile updated",
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * GET /api/user/me
 * Return current user (without password)
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
