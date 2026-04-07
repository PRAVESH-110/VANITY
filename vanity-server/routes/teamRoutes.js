const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTeam,
  inviteMember,
  updateMember,
  activateMember,
  removeMember,
} = require("../controllers/teamController");

router.get("/", authMiddleware, getTeam);
router.post("/", authMiddleware, inviteMember);
router.put("/:id", authMiddleware, updateMember);
router.post("/:id/toggle", authMiddleware, activateMember);
router.delete("/:id", authMiddleware, removeMember);

module.exports = router;
