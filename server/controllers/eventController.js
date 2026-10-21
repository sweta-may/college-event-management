const Event = require("../models/Event");

exports.listEvents = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.status) filter.status = req.query.status;

        const events = await Event.find(filter)
            .populate("organizer", "name email department")
            .sort({ startDate: 1 });
        return res.json({ events });
    } catch (error) {
        return next(error);
    }
};

exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("organizer", "name email department");
        if (!event) return res.status(404).json({ message: "Event not found" });
        return res.json({ event });
    } catch (error) {
        return next(error);
    }
};

exports.createEvent = async (req, res, next) => {
    try {
        const event = await Event.create({ ...req.body, organizer: req.user._id });
        return res.status(201).json({ event });
    } catch (error) {
        return next(error);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, organizer: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!event) return res.status(404).json({ message: "Event not found or not owned by you" });
        return res.json({ event });
    } catch (error) {
        return next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, organizer: req.user._id },
            { status: "cancelled" },
            { new: true }
        );
        if (!event) return res.status(404).json({ message: "Event not found or not owned by you" });
        return res.json({ event });
    } catch (error) {
        return next(error);
    }
};

exports.getEvents = exports.listEvents;
exports.getEventById = exports.getEvent;
