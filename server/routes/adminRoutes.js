const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  approveEvent,
  rejectEvent,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);

router.patch("/events/:eventId/approve", approveEvent);
router.patch("/events/:eventId/reject", rejectEvent);

module.exports = router;