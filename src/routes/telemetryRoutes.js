// routes/telemetryRoutes.js
const express = require("express");
const router = express.Router();
const telemetryController = require("../controllers/telemetryController");

// Telemetry & KPI Routes
router.post("/ingest/telemetry", telemetryController.ingestTelemetry);
router.get("/kpi/network", telemetryController.getNetworkKPIs);  // ✅ plural
router.get("/kpi/hub/:id", telemetryController.getHubKPIs);      // ✅ plural
router.get("/ts/:id", telemetryController.getTelemetryTimeseries);

module.exports = router;
