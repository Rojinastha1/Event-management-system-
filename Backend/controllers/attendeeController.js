// controllers/attendeeController.js
// Handles attendees: listing/search, viewing, creating, editing, deleting.

const attendeeModel = require("../models/attendeeModel");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, phone }) {
  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required.");
  if (!email || !email.trim()) errors.push("Email is required.");
  else if (!EMAIL_PATTERN.test(email.trim())) errors.push("Email format looks invalid.");
  if (!phone || !phone.trim()) errors.push("Phone number is required.");
  return errors;
}

function list(req, res) {
  const search = (req.query.search || "").toString();
  res.json(attendeeModel.findAll(search));
}

function getOne(req, res) {
  const attendee = attendeeModel.findById(Number(req.params.id));
  if (!attendee) return res.status(404).json({ error: "Attendee not found." });
  res.json(attendee);
}

function create(req, res) {
  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { name, email, phone } = req.body;
  const newAttendee = attendeeModel.create({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  res.status(201).json(newAttendee);
}

function update(req, res) {
  const attendee = attendeeModel.findById(Number(req.params.id));
  if (!attendee) return res.status(404).json({ error: "Attendee not found." });

  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { name, email, phone } = req.body;
  const updated = attendeeModel.update(attendee.id, { name: name.trim(), email: email.trim(), phone: phone.trim() });
  res.json(updated);
}

// Removing an attendee also removes their registration rows automatically
// (ON DELETE CASCADE, set up in database/db.js).
function remove(req, res) {
  attendeeModel.remove(Number(req.params.id));
  res.json({ success: true });
}

module.exports = { list, getOne, create, update, remove };
