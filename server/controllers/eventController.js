const Event = require("../models/Event");

// Whitelist of allowed fields to prevent mass-assignment
const ALLOWED_CREATE = [
  "title", "description", "category", "startDate", "endDate",
  "registrationDeadline", "venue", "capacity", "status",
];
const ALLOWED_UPDATE = [
  "title", "description", "category", "startDate", "endDate",
  "registrationDeadline", "venue", "capacity", "status",
];

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (k in obj) acc[k] = obj[k];
    return acc;
  }, {});
}

exports.listEvents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("organizer", "name email department")
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);

    return res.json({ events, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email department"
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json({ event });
  } catch (error) {
    return next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const data = pick(req.body, ALLOWED_CREATE);
    const required = [
      "title", "description", "category", "startDate",
      "endDate", "registrationDeadline", "venue", "capacity",
    ];
    const missing = required.filter((f) => !data[f]);
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }
    const event = await Event.create({ ...data, organizer: req.user._id });
    return res.status(201).json({ event });
  } catch (error) {
    return next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const data = pick(req.body, ALLOWED_UPDATE);
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user._id },
      data,
      { new: true, runValidators: true }
    );
    if (!event)
      return res
        .status(404)
        .json({ message: "Event not found or not owned by you" });
    return res.json({ event });
  } catch (error) {
    return next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    // Soft-delete: marks cancelled, preserves registration records
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user._id },
      { status: "cancelled" },
      { new: true }
    );
    if (!event)
      return res
        .status(404)
        .json({ message: "Event not found or not owned by you" });
    return res.json({ message: "Event cancelled successfully", event });
  } catch (error) {
    return next(error);
  }
};

// Aliases
exports.getEvents     = exports.listEvents;
exports.getEventById  = exports.getEvent;
