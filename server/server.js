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

// CORS — supports comma-separated origins in CLIENT_URL or allows all if not specified
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : null;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || !allowedOrigins || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return cb(null, true);
      }
      cb(null, true); // Fallback to allow Vercel dynamic preview domains
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "College Event Management API", status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global error handler (4 params required by Express)
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
