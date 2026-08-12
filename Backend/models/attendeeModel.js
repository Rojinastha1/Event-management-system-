// models/attendeeModel.js
// All database queries for the attendees table live here.

const db = require("../database/db");

function findAll(search) {
  return search
    ? db.prepare("SELECT * FROM attendees WHERE LOWER(name) LIKE ?").all(`%${search.toLowerCase()}%`)
    : db.prepare("SELECT * FROM attendees").all();
}

function findById(id) {
  return db.prepare("SELECT * FROM attendees WHERE id = ?").get(id);
}

function create({ name, email, phone }) {
  const result = db
    .prepare("INSERT INTO attendees (name, email, phone) VALUES (?, ?, ?)")
    .run(name, email, phone);
  return findById(result.lastInsertRowid);
}

function update(id, { name, email, phone }) {
  db.prepare("UPDATE attendees SET name = ?, email = ?, phone = ? WHERE id = ?").run(name, email, phone, id);
  return findById(id);
}

function remove(id) {
  db.prepare("DELETE FROM attendees WHERE id = ?").run(id);
}

module.exports = { findAll, findById, create, update, remove };
