const express = require("express");
const router = express.Router();

const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
  updateRegistrationStatus,
} = require("../controllers/registrationController");

const { protect, authorize } = require("../middleware/authMiddleware");

// IMPORTANT: static paths before parameterised paths to avoid shadowing
router.get("/my",           protect, authorize("student"),           getMyRegistrations);
router.get("/event/:eventId", protect, authorize("organizer","admin"), getEventParticipants);

router.post("/:eventId",             protect, authorize("student"),           registerForEvent);
router.patch("/:registrationId/cancel", protect, authorize("student"),        cancelRegistration);
router.patch("/:registrationId/status", protect, authorize("organizer","admin"), updateRegistrationStatus);

module.exports = router;
