// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { requireLogin } = require("../middlewares/authMiddleware");

router.get("/", requireLogin, eventController.list);
router.get("/:id", requireLogin, eventController.getOne);
router.post("/", requireLogin, eventController.create);
router.put("/:id", requireLogin, eventController.update);
router.delete("/:id", requireLogin, eventController.remove);

module.exports = router;
