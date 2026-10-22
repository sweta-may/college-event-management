const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  listAllEvents,
  listAllRegistrations,
  approveEvent,
  rejectEvent,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Every admin route requires authenticated admin role
router.use(protect, authorize("admin"));

router.get("/users",          getAllUsers);
router.patch("/users/:id/role", updateUserRole);

router.get("/events",                   listAllEvents);
router.patch("/events/:eventId/approve", approveEvent);
router.patch("/events/:eventId/reject",  rejectEvent);

router.get("/registrations", listAllRegistrations);

module.exports = router;
