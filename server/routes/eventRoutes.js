const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/",    getEvents);
router.get("/:id", getEventById);

// Organizer / admin only
router.post(   "/",    protect, authorize("organizer", "admin"), createEvent);
router.put(    "/:id", protect, authorize("organizer", "admin"), updateEvent);
router.delete( "/:id", protect, authorize("organizer", "admin"), deleteEvent);

module.exports = router;
