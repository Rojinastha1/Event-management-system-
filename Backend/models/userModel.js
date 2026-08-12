// models/userModel.js
// All database queries for the users table live here, so controllers
// never write raw SQL themselves.

const db = require("../database/db");

function findByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE LOWER(username) = ?").get(username.toLowerCase());
}

function create(username, passwordHash) {
  return db.prepare("INSERT INTO users (username, passwordHash) VALUES (?, ?)").run(username, passwordHash);
}

module.exports = { findByUsername, create };
