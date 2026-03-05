const express = require("express");
const router = express.Router();

router.post("/github", (req, res) => {
  try {
    console.log("📩 GitHub Webhook Received");
    console.log("Event:", req.headers["x-github-event"]);
    console.log("Payload:", req.body);

    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
    });

  } catch (error) {
    console.error("❌ Webhook Error:", error.message);

    // Always respond 200 to avoid GitHub retry loops
    return res.status(200).json({ success: false });
  }
});

module.exports = router;
