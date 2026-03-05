const express = require("express");
const router = express.Router();
const { getUserFlow } = require("../controllers/flowController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/my-flow", authMiddleware, getUserFlow);

module.exports = router;
