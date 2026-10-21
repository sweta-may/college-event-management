const mongoose = require('mongoose');
const registrationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "rejected",
                "cancelled",
                "waitlisted",
            ],
            default: "confirmed",
        },
        registeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

registrationSchema.index(
{ userId: 1, eventId: 1 },
{ unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);