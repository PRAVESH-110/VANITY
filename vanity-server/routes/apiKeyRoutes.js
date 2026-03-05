const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  generateApiKey,
  getApiKey,
} = require("../controllers/apiKeyController");

router.post("/generate", authMiddleware, generateApiKey);
router.get("/", authMiddleware, getApiKey);

module.exports = router;
