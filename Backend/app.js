const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Serve Frontend static files
app.use(express.static(path.join(__dirname, "../Frontend")));

// Route Mounts
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const attendeeRoutes = require("./routes/attendeeRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

// If your frontend calls /api/signup or /api/login directly:
app.use("/api", authRoutes);

// If your frontend calls /api/events, /api/attendees, etc.:
app.use("/api/events", eventRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/registrations", registrationRoutes);

module.exports = app;