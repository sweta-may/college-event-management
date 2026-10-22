const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

exports.listUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    return res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["student", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
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
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find()
        .populate("organizer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(),
    ]);

    return res.json({ events, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
};

exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["upcoming", "ongoing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.eventId || req.params.id,
      { status },
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
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find()
        .populate("userId", "name email")
        .populate("eventId", "title startDate venue")
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limit),
      Registration.countDocuments(),
    ]);

    return res.json({ registrations, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
};

exports.approveEvent = (req, res, next) => {
  req.body.status = "upcoming";
  return exports.updateEventStatus(req, res, next);
};

exports.rejectEvent = (req, res, next) => {
  req.body.status = "cancelled";
  return exports.updateEventStatus(req, res, next);
};

// Aliases
exports.getAllUsers = exports.listUsers;
