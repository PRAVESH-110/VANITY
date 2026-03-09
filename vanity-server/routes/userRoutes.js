const express = require("express");
const router = express.Router();
const { updateProfile, getMe } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, getMe);
router.post("/profile", authMiddleware, updateProfile);

module.exports = router;
