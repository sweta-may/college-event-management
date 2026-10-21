const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

exports.listUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.json({ users });
    } catch (error) {
        return next(error);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { new: true, runValidators: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ user });
    } catch (error) {
        return next(error);
    }
};

exports.listAllEvents = async (req, res, next) => {
    try {
        const events = await Event.find()
            .populate("organizer", "name email")
            .sort({ createdAt: -1 });
        return res.json({ events });
    } catch (error) {
        return next(error);
    }
};

exports.updateEventStatus = async (req, res, next) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.eventId || req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!event) return res.status(404).json({ message: "Event not found" });
        return res.json({ event });
    } catch (error) {
        return next(error);
    }
};

exports.listAllRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find()
            .populate("userId", "name email")
            .populate("eventId", "title startDate venue")
            .sort({ registeredAt: -1 });
        return res.json({ registrations });
    } catch (error) {
        return next(error);
    }
};

exports.getAllUsers = exports.listUsers;

exports.approveEvent = (req, res, next) => {
    req.body.status = "upcoming";
    return exports.updateEventStatus(req, res, next);
};

exports.rejectEvent = (req, res, next) => {
    req.body.status = "cancelled";
    return exports.updateEventStatus(req, res, next);
};
