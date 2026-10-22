const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/college_event_management";
    await mongoose.connect(uri);
    const dbName = mongoose.connection.name;
    console.log(`MongoDB connected — database: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
