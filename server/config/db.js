
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/college_event_management";

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully!");
    console.log("Database: college_event_management");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;