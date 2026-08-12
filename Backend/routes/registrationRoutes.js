// routes/registrationRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { requireLogin } = require("../middlewares/authMiddleware");

router.post("/register", requireLogin, eventController.register);
router.post("/unregister", requireLogin, eventController.unregister);

module.exports = router;
