// routes/alertRoutes.js
const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");

// Routes
router.get("/", alertController.getAlerts);
router.get("/stats", alertController.getAlertStats);
router.get("/trend/:id", alertController.getAlertTrend);

module.exports = router;
