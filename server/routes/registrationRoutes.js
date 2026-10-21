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

router.post(
  "/:eventId",
  protect,
  authorize("student"),
  registerForEvent
);

router.patch(
  "/:registrationId/cancel",
  protect,
  authorize("student"),
  cancelRegistration
);

router.get(
  "/my",
  protect,
  authorize("student"),
  getMyRegistrations
);

router.get(
  "/event/:eventId",
  protect,
  authorize("organizer", "admin"),
  getEventParticipants
);

router.patch(
  "/:registrationId/status",
  protect,
  authorize("organizer", "admin"),
  updateRegistrationStatus
);

module.exports = router;