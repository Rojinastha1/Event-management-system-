// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
}

function login(req, res) {
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "").trim();

  const user = userModel.findByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = generateToken(user);
  res.json({ token, username: user.username });
}

function signup(req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "").trim();

  const errors = [];
  if (!username) errors.push("Username is required.");
  if (username && userModel.findByUsername(username)) errors.push("That username is already taken.");
  if (!password) errors.push("Password is required.");
  else if (password.length < 6) errors.push("Password must be at least 6 characters.");
  if (errors.length > 0) return res.status(400).json({ errors });

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = userModel.create(username, passwordHash);

  const newUser = { id: result.lastInsertRowid, username };
  const token = generateToken(newUser);

  res.status(201).json({ token, username });
}

function logout(req, res) {
  res.json({ success: true, message: "Logged out successfully." });
}

module.exports = { login, signup, logout };