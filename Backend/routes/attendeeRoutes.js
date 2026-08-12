// routes/attendeeRoutes.js
const express = require("express");
const router = express.Router();
const attendeeController = require("../controllers/attendeeController");
const { requireLogin } = require("../middlewares/authMiddleware");

router.get("/", requireLogin, attendeeController.list);
router.get("/:id", requireLogin, attendeeController.getOne);
router.post("/", requireLogin, attendeeController.create);
router.put("/:id", requireLogin, attendeeController.update);
router.delete("/:id", requireLogin, attendeeController.remove);

module.exports = router;
