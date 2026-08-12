// database/db.js
// Sets up the SQLite database (data.db) and creates the tables the first
// time the app runs. If an old data.json file from the previous version
// of this project is sitting next to it, its contents are copied into
// the database once, and the JSON file is renamed to data.json.bak so
// it's obviously no longer the live source of data.

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DB_FILE = path.join(__dirname, "..", "data.db");
const OLD_JSON_FILE = path.join(__dirname, "..", "data.json");

const db = new Database(DB_FILE);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS registrations (
    eventId INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendeeId INTEGER NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
    PRIMARY KEY (eventId, attendeeId)
  );
`);

// ---------- First-run setup: migrate old JSON data, or seed an admin ----------

const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;

if (userCount === 0) {
  if (fs.existsSync(OLD_JSON_FILE)) {
    migrateFromJson();
  } else {
    seedDefaultAdmin();
  }
}

function migrateFromJson() {
  const raw = JSON.parse(fs.readFileSync(OLD_JSON_FILE, "utf-8"));

  const insertUser = db.prepare("INSERT INTO users (username, passwordHash) VALUES (?, ?)");
  const insertEvent = db.prepare(
    "INSERT INTO events (id, name, description, date, time, location) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertAttendee = db.prepare("INSERT INTO attendees (id, name, email, phone) VALUES (?, ?, ?, ?)");
  const insertReg = db.prepare("INSERT OR IGNORE INTO registrations (eventId, attendeeId) VALUES (?, ?)");

  const migrate = db.transaction(() => {
    (raw.users || []).forEach((u) => insertUser.run(u.username, u.passwordHash));
    (raw.events || []).forEach((e) =>
      insertEvent.run(e.id, e.name, e.description || "", e.date, e.time, e.location)
    );
    (raw.attendees || []).forEach((a) => insertAttendee.run(a.id, a.name, a.email, a.phone));
    (raw.registrations || []).forEach((r) => insertReg.run(r.eventId, r.attendeeId));
  });
  migrate();

  fs.renameSync(OLD_JSON_FILE, path.join(__dirname, "..", "data.json.bak"));
  console.log("Migrated data.json into data.db (old file kept as data.json.bak)");
}

function seedDefaultAdmin() {
  const passwordHash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, passwordHash) VALUES (?, ?)").run("admin", passwordHash);
  console.log("Created default admin user -> username: admin, password: admin123");
}

module.exports = db;
