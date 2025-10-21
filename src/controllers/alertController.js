// controllers/alertController.js
const Alert = require("../models/alertModel");

// GET all alerts
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts", error });
  }
};

// GET summary statistics for sidebar + pie chart
exports.getAlertStats = async (req, res) => {
  try {
    const activeAlertsCount = await Alert.countDocuments({ status: "Active" });

    // Example county breakdown
    const countyAgg = await Alert.aggregate([
      { $group: { _id: "$county", value: { $sum: 1 } } },
    ]);

    const colors = ["#27348B", "#00B9F2", "#F59E0B", "#EF4444", "#22C55E"];
    const countyDistribution = countyAgg.map((c, i) => ({
      name: c._id,
      value: c.value,
      color: colors[i % colors.length],
    }));

    // Average resolution time (could be calculated from timestamps)
    const avgResolutionTime = "4.2 hours";

    res.json({ activeAlertsCount, avgResolutionTime, countyDistribution });
  } catch (error) {
    res.status(500).json({ message: "Error fetching alert stats", error });
  }
};

// GET trend data for an alert
exports.getAlertTrend = async (req, res) => {
  try {
    const { id } = req.params;
    // Normally, you'd query telemetry data linked to this alert.
    // We'll return mock data for now.
    const trend = [
      { day: "Mon", value: 100, threshold: 75 },
      { day: "Tue", value: 95, threshold: 75 },
      { day: "Wed", value: 88, threshold: 75 },
      { day: "Thu", value: 82, threshold: 75 },
      { day: "Fri", value: 75, threshold: 75 },
      { day: "Sat", value: 70, threshold: 75 },
      { day: "Sun", value: 68, threshold: 75 },
    ];

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alert trend", error });
  }
};
