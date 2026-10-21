const Event = require("../models/Event");
const Registration = require("../models/Registration");

exports.registerForEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event || event.status === "cancelled") {
            return res.status(404).json({ message: "Event not found or unavailable" });
        }
        if (new Date() > event.registrationDeadline) {
            return res.status(400).json({ message: "Registration deadline has passed" });
        }

        const registrationCount = await Registration.countDocuments({
            eventId: event._id,
            status: { $in: ["pending", "confirmed"] },
        });
        if (registrationCount >= event.capacity) {
            return res.status(409).json({ message: "This event is full" });
        }

        const registration = await Registration.create({
            userId: req.user._id,
            eventId: event._id,
        });
        return res.status(201).json({ registration });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "You are already registered for this event" });
        }
        return next(error);
    }
};

exports.getMyRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({ userId: req.user._id })
            .populate("eventId")
            .sort({ registeredAt: -1 });
        return res.json({ registrations });
    } catch (error) {
        return next(error);
    }
};

exports.cancelRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findOneAndUpdate(
            { _id: req.params.registrationId, userId: req.user._id },
            { status: "cancelled" },
            { new: true }
        );
        if (!registration) return res.status(404).json({ message: "Registration not found" });
        return res.json({ registration });
    } catch (error) {
        return next(error);
    }
};

exports.getEventRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({ eventId: req.params.eventId })
            .populate("userId", "name email department")
            .sort({ registeredAt: -1 });
        return res.json({ registrations });
    } catch (error) {
        return next(error);
    }
};

exports.updateRegistrationStatus = async (req, res, next) => {
    try {
        const registration = await Registration.findByIdAndUpdate(
            req.params.registrationId,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!registration) return res.status(404).json({ message: "Registration not found" });
        return res.json({ registration });
    } catch (error) {
        return next(error);
    }
};

exports.getEventParticipants = exports.getEventRegistrations;
