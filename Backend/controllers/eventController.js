// controllers/eventController.js
// Handles events: listing/search, viewing, creating, editing, deleting,
// and registering/unregistering attendees.

const eventModel = require("../models/eventModel");
const attendeeModel = require("../models/attendeeModel");
const registrationModel = require("../models/registrationModel");

function validate({ name, date, time, location }) {
  const errors = [];
  if (!name || !name.trim()) errors.push("Event name is required.");
  if (!date || !date.trim()) errors.push("Date is required.");
  if (!time || !time.trim()) errors.push("Time is required.");
  if (!location || !location.trim()) errors.push("Location is required.");
  return errors;
}

// Get all events, optionally filtered by ?search=name, with each
// event's attendee count attached.
function list(req, res) {
  const search = (req.query.search || "").toString();
  const events = eventModel.findAll(search);
  const withCounts = events.map((e) => ({ ...e, attendeeCount: eventModel.attendeeCount(e.id) }));
  res.json(withCounts);
}

// Get one event, including its registered attendees.
function getOne(req, res) {
  const event = eventModel.findById(Number(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found." });

  const attendees = eventModel.attendeesFor(event.id);
  res.json({ ...event, attendees });
}

function create(req, res) {
  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { name, description, date, time, location } = req.body;
  const newEvent = eventModel.create({
    name: name.trim(),
    description: (description || "").trim(),
    date,
    time,
    location: location.trim(),
  });
  res.status(201).json(newEvent);
}

function update(req, res) {
  const event = eventModel.findById(Number(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found." });

  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { name, description, date, time, location } = req.body;
  const updated = eventModel.update(event.id, {
    name: name.trim(),
    description: (description || "").trim(),
    date,
    time,
    location: location.trim(),
  });
  res.json(updated);
}

// Deleting an event also removes its registration rows automatically
// (ON DELETE CASCADE, set up in database/db.js).
function remove(req, res) {
  eventModel.remove(Number(req.params.id));
  res.json({ success: true });
}

function register(req, res) {
  const eventId = Number(req.body.eventId);
  const attendeeId = Number(req.body.attendeeId);

  if (!eventModel.findById(eventId) || !attendeeModel.findById(attendeeId)) {
    return res.status(404).json({ error: "Event or attendee not found." });
  }
  if (registrationModel.exists(eventId, attendeeId)) {
    return res.status(400).json({ error: "This attendee is already registered for this event." });
  }

  registrationModel.register(eventId, attendeeId);
  res.status(201).json({ success: true });
}

function unregister(req, res) {
  const eventId = Number(req.body.eventId);
  const attendeeId = Number(req.body.attendeeId);
  registrationModel.unregister(eventId, attendeeId);
  res.json({ success: true });
}

module.exports = { list, getOne, create, update, remove, register, unregister };
