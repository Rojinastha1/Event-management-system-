// models/eventModel.js
// All database queries for the events table (and the attendee-facing
// side of registrations) live here.

const db = require("../database/db");

function findAll(search) {
  return search
    ? db.prepare("SELECT * FROM events WHERE LOWER(name) LIKE ?").all(`%${search.toLowerCase()}%`)
    : db.prepare("SELECT * FROM events").all();
}

function findById(id) {
  return db.prepare("SELECT * FROM events WHERE id = ?").get(id);
}

function attendeeCount(eventId) {
  return db.prepare("SELECT COUNT(*) AS n FROM registrations WHERE eventId = ?").get(eventId).n;
}

function attendeesFor(eventId) {
  return db
    .prepare(
      `SELECT a.* FROM attendees a
       JOIN registrations r ON r.attendeeId = a.id
       WHERE r.eventId = ?`
    )
    .all(eventId);
}

function create({ name, description, date, time, location }) {
  const result = db
    .prepare("INSERT INTO events (name, description, date, time, location) VALUES (?, ?, ?, ?, ?)")
    .run(name, description, date, time, location);
  return findById(result.lastInsertRowid);
}

function update(id, { name, description, date, time, location }) {
  db.prepare("UPDATE events SET name = ?, description = ?, date = ?, time = ?, location = ? WHERE id = ?").run(
    name,
    description,
    date,
    time,
    location,
    id
  );
  return findById(id);
}

function remove(id) {
  db.prepare("DELETE FROM events WHERE id = ?").run(id);
}

module.exports = { findAll, findById, attendeeCount, attendeesFor, create, update, remove };
