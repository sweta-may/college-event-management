const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb+srv://swetasakthivel5_db_user:WxcHtBksA0UfbyXe@cluster0.x8bnj3o.mongodb.net/college_event_management?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    const dbName = mongoose.connection.name;
    console.log(`MongoDB connected — database: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
