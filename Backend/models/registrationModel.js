// models/registrationModel.js
// All database queries for the registrations join table (which
// attendees are signed up for which events) live here.

const db = require("../database/db");

function exists(eventId, attendeeId) {
  return !!db.prepare("SELECT 1 FROM registrations WHERE eventId = ? AND attendeeId = ?").get(eventId, attendeeId);
}

function register(eventId, attendeeId) {
  db.prepare("INSERT INTO registrations (eventId, attendeeId) VALUES (?, ?)").run(eventId, attendeeId);
}

function unregister(eventId, attendeeId) {
  db.prepare("DELETE FROM registrations WHERE eventId = ? AND attendeeId = ?").run(eventId, attendeeId);
}

module.exports = { exists, register, unregister };
