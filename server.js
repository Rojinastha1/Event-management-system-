// server.js
//
// A beginner-friendly backend for the Event Management System.
// Instead of a real database, we just read and write a file called
// data.json. Instead of JWT, we use a simple random "token" that we
// remember in a list on the server while it's running.

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serves index.html, style.css, script.js, etc.

// ---------- Tiny "database" helpers ----------

function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Give every new item a simple unique id
function nextId(list) {
  return list.length === 0 ? 1 : Math.max(...list.map((item) => item.id)) + 1;
}

// ---------- Seed a default admin user the first time we run ----------

let data = readData();
if (data.users.length === 0) {
  const passwordHash = bcrypt.hashSync("admin123", 10); // password is hashed, never stored as plain text
  data.users.push({ username: "admin", passwordHash });
  saveData(data);
  console.log("Created default admin user -> username: admin, password: admin123");
}

// ---------- Simple login "sessions" ----------
// Every time someone logs in successfully, we make up a random token and
// remember it here. Any request that includes a token from this list is
// considered logged in. This resets if you restart the server - that's fine
// for a learning project.

const validTokens = new Set();

function requireLogin(req, res, next) {
  const token = req.headers["authorization"];
  if (token && validTokens.has(token)) {
    next(); // token is valid, let the request through
  } else {
    res.status(401).json({ error: "Please log in first." });
  }
}

// ---------- AUTH ROUTES ----------

app.post("/api/login", (req, res) => {
  // normalize both fields so a stray space or wrong letter case
  // (from autofill, autocorrect, or a typo) doesn't lock you out
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "").trim();
  const data = readData();

  const user = data.users.find((u) => u.username.toLowerCase() === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = crypto.randomBytes(16).toString("hex");
  validTokens.add(token);

  res.json({ token, username: user.username });
});

app.post("/api/logout", requireLogin, (req, res) => {
  validTokens.delete(req.headers["authorization"]);
  res.json({ success: true });
});

// ---------- EVENT ROUTES (all protected - must be logged in) ----------

// Get all events, optionally filtered by ?search=name
app.get("/api/events", requireLogin, (req, res) => {
  const data = readData();
  const search = (req.query.search || "").toLowerCase();

  let events = data.events;
  if (search) {
    events = events.filter((e) => e.name.toLowerCase().includes(search));
  }

  // add attendee count to each event
  const withCounts = events.map((e) => ({
    ...e,
    attendeeCount: data.registrations.filter((r) => r.eventId === e.id).length,
  }));

  res.json(withCounts);
});

// Get one event, including its registered attendees
app.get("/api/events/:id", requireLogin, (req, res) => {
  const data = readData();
  const event = data.events.find((e) => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found." });

  const attendeeIds = data.registrations
    .filter((r) => r.eventId === event.id)
    .map((r) => r.attendeeId);
  const attendees = data.attendees.filter((a) => attendeeIds.includes(a.id));

  res.json({ ...event, attendees });
});

// Create an event
app.post("/api/events", requireLogin, (req, res) => {
  const { name, description, date, time, location } = req.body;

  // ---- validation: required fields can't be blank ----
  const errors = [];
  if (!name || !name.trim()) errors.push("Event name is required.");
  if (!date || !date.trim()) errors.push("Date is required.");
  if (!time || !time.trim()) errors.push("Time is required.");
  if (!location || !location.trim()) errors.push("Location is required.");
  if (errors.length > 0) return res.status(400).json({ errors });

  const data = readData();
  const newEvent = {
    id: nextId(data.events),
    name: name.trim(),
    description: (description || "").trim(),
    date,
    time,
    location: location.trim(),
  };
  data.events.push(newEvent);
  saveData(data);

  res.status(201).json(newEvent);
});

// Update an event
app.put("/api/events/:id", requireLogin, (req, res) => {
  const data = readData();
  const event = data.events.find((e) => e.id === Number(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found." });

  const { name, description, date, time, location } = req.body;

  const errors = [];
  if (!name || !name.trim()) errors.push("Event name is required.");
  if (!date || !date.trim()) errors.push("Date is required.");
  if (!time || !time.trim()) errors.push("Time is required.");
  if (!location || !location.trim()) errors.push("Location is required.");
  if (errors.length > 0) return res.status(400).json({ errors });

  event.name = name.trim();
  event.description = (description || "").trim();
  event.date = date;
  event.time = time;
  event.location = location.trim();
  saveData(data);

  res.json(event);
});

// Delete an event
app.delete("/api/events/:id", requireLogin, (req, res) => {
  const data = readData();
  const eventId = Number(req.params.id);
  data.events = data.events.filter((e) => e.id !== eventId);
  data.registrations = data.registrations.filter((r) => r.eventId !== eventId);
  saveData(data);
  res.json({ success: true });
});

// ---------- ATTENDEE ROUTES ----------

app.get("/api/attendees", requireLogin, (req, res) => {
  const data = readData();
  const search = (req.query.search || "").toLowerCase();

  let attendees = data.attendees;
  if (search) {
    attendees = attendees.filter((a) => a.name.toLowerCase().includes(search));
  }
  res.json(attendees);
});

app.get("/api/attendees/:id", requireLogin, (req, res) => {
  const data = readData();
  const attendee = data.attendees.find((a) => a.id === Number(req.params.id));
  if (!attendee) return res.status(404).json({ error: "Attendee not found." });
  res.json(attendee);
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/api/attendees", requireLogin, (req, res) => {
  const { name, email, phone } = req.body;

  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required.");
  if (!email || !email.trim()) errors.push("Email is required.");
  else if (!EMAIL_PATTERN.test(email.trim())) errors.push("Email format looks invalid.");
  if (!phone || !phone.trim()) errors.push("Phone number is required.");
  if (errors.length > 0) return res.status(400).json({ errors });

  const data = readData();
  const newAttendee = {
    id: nextId(data.attendees),
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
  };
  data.attendees.push(newAttendee);
  saveData(data);

  res.status(201).json(newAttendee);
});

app.put("/api/attendees/:id", requireLogin, (req, res) => {
  const data = readData();
  const attendee = data.attendees.find((a) => a.id === Number(req.params.id));
  if (!attendee) return res.status(404).json({ error: "Attendee not found." });

  const { name, email, phone } = req.body;
  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required.");
  if (!email || !email.trim()) errors.push("Email is required.");
  else if (!EMAIL_PATTERN.test(email.trim())) errors.push("Email format looks invalid.");
  if (!phone || !phone.trim()) errors.push("Phone number is required.");
  if (errors.length > 0) return res.status(400).json({ errors });

  attendee.name = name.trim();
  attendee.email = email.trim();
  attendee.phone = phone.trim();
  saveData(data);

  res.json(attendee);
});

app.delete("/api/attendees/:id", requireLogin, (req, res) => {
  const data = readData();
  const attendeeId = Number(req.params.id);
  data.attendees = data.attendees.filter((a) => a.id !== attendeeId);
  data.registrations = data.registrations.filter((r) => r.attendeeId !== attendeeId);
  saveData(data);
  res.json({ success: true });
});

// ---------- REGISTRATION ROUTES (assign attendees to events) ----------

app.post("/api/register", requireLogin, (req, res) => {
  const { eventId, attendeeId } = req.body;
  const data = readData();

  const eventExists = data.events.some((e) => e.id === Number(eventId));
  const attendeeExists = data.attendees.some((a) => a.id === Number(attendeeId));
  if (!eventExists || !attendeeExists) {
    return res.status(404).json({ error: "Event or attendee not found." });
  }

  const alreadyRegistered = data.registrations.some(
    (r) => r.eventId === Number(eventId) && r.attendeeId === Number(attendeeId)
  );
  if (alreadyRegistered) {
    return res.status(400).json({ error: "This attendee is already registered for this event." });
  }

  data.registrations.push({ eventId: Number(eventId), attendeeId: Number(attendeeId) });
  saveData(data);

  res.status(201).json({ success: true });
});

app.post("/api/unregister", requireLogin, (req, res) => {
  const { eventId, attendeeId } = req.body;
  const data = readData();

  data.registrations = data.registrations.filter(
    (r) => !(r.eventId === Number(eventId) && r.attendeeId === Number(attendeeId))
  );
  saveData(data);

  res.json({ success: true });
});

// ---------- Start the server ----------

app.listen(PORT, () => {
  console.log(`Event Management System running at http://localhost:${PORT}`);
});
