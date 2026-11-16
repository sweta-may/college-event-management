const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Security headers
app.use(helmet());

// CORS — allows all origins including Vercel
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "College Event Management API", status: "ok" });
});

// API Routes — mounted on both /api/* and /* so it works whether Vercel includes /api or not!
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/events", eventRoutes);
app.use("/events", eventRoutes);

app.use("/api/registrations", registrationRoutes);
app.use("/registrations", registrationRoutes);

app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB, exiting:", err);
    process.exit(1);
  });

module.exports = app;
