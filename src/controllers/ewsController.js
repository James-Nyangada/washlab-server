// controllers/ewsController.js
const Telemetry = require("../models/Telemetry");
const Ticket = require("../models/Ticket");
const Asset = require("../models/Asset");
const dayjs = require("dayjs");

// Simulated in-memory alert model (can later persist to DB)
let alertsCache = [];

// @desc Get active early warning alerts
exports.getActiveAlerts = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    // Optional: derive alerts dynamically from telemetry
    const since = dayjs().subtract(1, "day").toDate();
    const telemetry = await Telemetry.find({ createdAt: { $gte: since } })
      .populate("asset", "siteName county");

    // Dynamic alert logic
    const alerts = telemetry
      .filter(
        (t) =>
          t.turbidity > 5 || // high turbidity
          t.chlorineResidual < 0.2 || // low chlorine
          t.flowRate < 2 // low flow (potential pump issue)
      )
      .map((t) => ({
        id: t._id,
        assetId: t.asset._id,
        hub: t.asset.siteName,
        type:
          t.turbidity > 5
            ? "Water Quality"
            : t.chlorineResidual < 0.2
            ? "Low Chlorine"
            : "Low Flow",
        severity:
          t.turbidity > 10 || t.flowRate < 1 ? "critical" : "warning",
        timestamp: t.createdAt,
        status: "active",
      }));

    // Optionally merge with stored alertsCache
    alertsCache = alerts;

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching EWS alerts:", error);
    res.status(500).json({ message: "Error fetching alerts", error: error.message });
  }
};

// @desc Link alert → ticket (create ticket for alert)
exports.linkAlertToTicket = async (req, res) => {
  try {
    const { alertId, assetId, title, createdBy } = req.body;

    if (!assetId || !title)
      return res.status(400).json({ message: "assetId and title are required" });

    const alert = alertsCache.find((a) => a.id === alertId);

    const ticket = await Ticket.create({
      asset: assetId,
      title,
      description: alert ? `${alert.type} detected at ${alert.hub}` : "Automated EWS alert",
      category: "sensor",
      priority: alert?.severity === "critical" ? "high" : "medium",
      status: "open",
      createdBy,
    });

    // Mark alert as linked/closed in memory
    if (alert) alert.status = "linked";

    res.status(201).json({ message: "Alert linked to ticket", ticket });
  } catch (error) {
    console.error("Error linking alert to ticket:", error);
    res.status(500).json({ message: "Error linking alert", error: error.message });
  }
};
