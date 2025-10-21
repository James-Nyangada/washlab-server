// controllers/telemetryController.js
const Telemetry = require("../models/Telemetry");
const Asset = require("../models/Asset");
const BillingSummary = require("../models/BillingSummary");
const dayjs = require("dayjs");

// @desc Ingest new telemetry data (IoT gateway → DB)
exports.ingestTelemetry = async (req, res) => {
  try {
    const {
      assetId,
      flowRate,
      pressure,
      turbidity,
      chlorineResidual,
      energySource,
      voltage,
      runtimeHours,
      signalStrength,
    } = req.body;

    if (!assetId) return res.status(400).json({ message: "Missing assetId" });

    const telemetry = await Telemetry.create({
      asset: assetId,
      flowRate,
      pressure,
      turbidity,
      chlorineResidual,
      energySource,
      voltage,
      runtimeHours,
      signalStrength,
    });

    res.status(201).json({ message: "Telemetry data ingested", telemetry });
  } catch (error) {
    console.error("Error ingesting telemetry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Network KPIs (aggregated view for all assets)
exports.getNetworkKPIs = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const days = parseInt(period.replace("d", "")) || 30;

    const sinceDate = dayjs().subtract(days, "day").toDate();

    const telemetryStats = await Telemetry.aggregate([
      { $match: { createdAt: { $gte: sinceDate } } },
      {
        $group: {
          _id: null,
          avgFlow: { $avg: "$flowRate" },
          avgPressure: { $avg: "$pressure" },
          avgTurbidity: { $avg: "$turbidity" },
          avgChlorine: { $avg: "$chlorineResidual" },
        },
      },
    ]);

    const assetsCount = await Asset.countDocuments();
    const activeAssets = await Asset.countDocuments({ status: "active" });

    const financeStats = await BillingSummary.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: "$totalBilledKES" },
          totalCollected: { $sum: "$totalCollectedKES" },
          avgEfficiency: { $avg: "$collectionEfficiency" },
        },
      },
    ]);

    const summary = {
      totalAssets: assetsCount,
      activeAssets,
      avgFlow: telemetryStats[0]?.avgFlow || 0,
      avgPressure: telemetryStats[0]?.avgPressure || 0,
      avgTurbidity: telemetryStats[0]?.avgTurbidity || 0,
      avgChlorine: telemetryStats[0]?.avgChlorine || 0,
      totalBilledKES: financeStats[0]?.totalBilled || 0,
      totalCollectedKES: financeStats[0]?.totalCollected || 0,
      avgCollectionEfficiency: financeStats[0]?.avgEfficiency || 0,
    };

    res.json(summary);
  } catch (error) {
    console.error("Error fetching network KPIs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Hub-specific KPIs
exports.getHubKPIs = async (req, res) => {
  try {
    const { id } = req.params;

    const latest = await Telemetry.find({ asset: id })
      .sort({ createdAt: -1 })
      .limit(1);

    const finance = await BillingSummary.findOne({ asset: id })
      .sort({ createdAt: -1 })
      .lean();

    const data = {
      assetId: id,
      uptimePercent: 99.2, // mock for now, can be derived from telemetry gaps
      avgFlow: latest[0]?.flowRate || 0,
      avgPressure: latest[0]?.pressure || 0,
      turbidity: latest[0]?.turbidity || 0,
      chlorineResidual: latest[0]?.chlorineResidual || 0,
      totalBilledKES: finance?.totalBilledKES || 0,
      totalCollectedKES: finance?.totalCollectedKES || 0,
      collectionEfficiency: finance?.collectionEfficiency || 0,
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching hub KPIs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get telemetry timeseries data
exports.getTelemetryTimeseries = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, bucket = "5m" } = req.query;

    const start = from ? new Date(from) : dayjs().subtract(1, "day").toDate();
    const end = to ? new Date(to) : new Date();

    // Basic bucket logic (for now group by 5-minute intervals)
    const bucketMs =
      parseInt(bucket.replace("m", "")) * 60 * 1000 || 5 * 60 * 1000;

    const telemetry = await Telemetry.aggregate([
      {
        $match: {
          asset: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $toLong: {
              $subtract: [
                { $toLong: "$createdAt" },
                { $mod: [{ $toLong: "$createdAt" }, bucketMs] },
              ],
            },
          },
          avgFlow: { $avg: "$flowRate" },
          avgPressure: { $avg: "$pressure" },
          avgTurbidity: { $avg: "$turbidity" },
          avgChlorine: { $avg: "$chlorineResidual" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = telemetry.map((t) => ({
      timestamp: new Date(t._id),
      flowRate: t.avgFlow,
      pressure: t.avgPressure,
      turbidity: t.avgTurbidity,
      chlorineResidual: t.avgChlorine,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching timeseries:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
