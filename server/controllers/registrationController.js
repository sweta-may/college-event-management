const Event = require("../models/Event");
const Registration = require("../models/Registration");

// POST /api/registrations/:eventId
exports.registerForEvent = async (req, res, next) => {
  let claimedEventId = null;

  try {
    // Pre-check for useful error messages
    const eventCheck = await Event.findById(req.params.eventId);
    if (!eventCheck || eventCheck.status === "cancelled") {
      return res
        .status(404)
        .json({ message: "Event not found or unavailable" });
    }
    if (new Date() > eventCheck.registrationDeadline) {
      return res
        .status(400)
        .json({ message: "Registration deadline has passed" });
    }

    // Atomically claim a spot — prevents race conditions
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: req.params.eventId,
        status: { $ne: "cancelled" },
        $expr: { $lt: ["$registeredCount", "$capacity"] },
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(409).json({ message: "This event is full" });
    }
    claimedEventId = updatedEvent._id;

    const registration = await Registration.create({
      userId: req.user._id,
      eventId: claimedEventId,
    });

    return res.status(201).json({ registration });
  } catch (error) {
    // Roll back the claimed spot on any failure
    if (claimedEventId) {
      await Event.findByIdAndUpdate(claimedEventId, {
        $inc: { registeredCount: -1 },
      }).catch(() => {});
    }
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You are already registered for this event" });
    }
    return next(error);
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find({ userId: req.user._id })
        .populate("eventId")
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limit),
      Registration.countDocuments({ userId: req.user._id }),
    ]);

    return res.json({ registrations, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/registrations/:registrationId/cancel
exports.cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({
      _id: req.params.registrationId,
      userId: req.user._id,
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    if (registration.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Registration is already cancelled" });
    }

    const wasActive = ["pending", "confirmed"].includes(registration.status);
    registration.status = "cancelled";
    await registration.save();

    // Free the spot if it was an active registration
    if (wasActive) {
      await Event.findByIdAndUpdate(registration.eventId, {
        $inc: { registeredCount: -1 },
      });
    }

    return res.json({ registration });
  } catch (error) {
    return next(error);
  }
};

// GET /api/registrations/event/:eventId  (organizer/admin)
exports.getEventRegistrations = async (req, res, next) => {
  try {
    // Ownership check — organizer must own the event
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You do not own this event" });
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find({ eventId: req.params.eventId })
        .populate("userId", "name email department")
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limit),
      Registration.countDocuments({ eventId: req.params.eventId }),
    ]);

    return res.json({ registrations, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/registrations/:registrationId/status  (organizer/admin)
exports.updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "confirmed", "rejected", "cancelled", "waitlisted"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const registration = await Registration.findById(
      req.params.registrationId
    ).populate("eventId");
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Ownership check
    if (
      req.user.role !== "admin" &&
      registration.eventId.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You do not own this event" });
    }

    registration.status = status;
    await registration.save({ validateModifiedOnly: true });

    return res.json({ registration });
  } catch (error) {
    return next(error);
  }
};

exports.getEventParticipants = exports.getEventRegistrations;
