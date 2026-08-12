// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireLogin } = require("../middlewares/authMiddleware");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", requireLogin, authController.logout);

module.exports = router;
