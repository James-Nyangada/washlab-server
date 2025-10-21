// controllers/financeController.js
const BillingSummary = require("../models/BillingSummary");
const BillingPeriod = require("../models/BillingPeriod");
const Asset = require("../models/Asset");
const dayjs = require("dayjs");

// @desc Get finance summary for the selected period
exports.getFinanceSummary = async (req, res) => {
  try {
    const { period = "last_month" } = req.query;

    let startDate, endDate;

    if (period === "last_month") {
      startDate = dayjs().subtract(1, "month").startOf("month").toDate();
      endDate = dayjs().subtract(1, "month").endOf("month").toDate();
    } else if (period === "this_month") {
      startDate = dayjs().startOf("month").toDate();
      endDate = dayjs().endOf("month").toDate();
    } else if (period.endsWith("d")) {
      const days = parseInt(period.replace("d", ""));
      startDate = dayjs().subtract(days, "day").toDate();
      endDate = new Date();
    } else {
      return res.status(400).json({ message: "Invalid period format" });
    }

    // Find billing summaries in that period
    const summaries = await BillingSummary.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("asset", "siteName county");

    const totals = summaries.reduce(
      (acc, s) => {
        acc.totalBilled += s.totalBilledKES || 0;
        acc.totalCollected += s.totalCollectedKES || 0;
        acc.totalArrears += s.arrearsKES || 0;
        acc.totalCost += s.oAndMCostKES || 0;
        return acc;
      },
      { totalBilled: 0, totalCollected: 0, totalArrears: 0, totalCost: 0 }
    );

    const collectionEfficiency =
      totals.totalBilled > 0
        ? (totals.totalCollected / totals.totalBilled) * 100
        : 0;
    const omCoverage =
      totals.totalCost > 0
        ? (totals.totalCollected / totals.totalCost) * 100
        : 0;

    res.json({
      period,
      totalBilledKES: totals.totalBilled,
      totalCollectedKES: totals.totalCollected,
      totalArrearsKES: totals.totalArrears,
      collectionEfficiency: collectionEfficiency.toFixed(1),
      oAndMCoverage: omCoverage.toFixed(1),
      recordCount: summaries.length,
    });
  } catch (error) {
    console.error("Error fetching finance summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get debtors aging report (buckets: 30, 60, 90 days)
exports.getDebtors = async (req, res) => {
  try {
    const { bucket = "30,60,90" } = req.query;
    const buckets = bucket.split(",").map((b) => parseInt(b));

    // Simulated logic for overdue analysis
    const allSummaries = await BillingSummary.find().populate(
      "asset",
      "siteName county"
    );

    // Assign random overdue days to simulate dataset
    const debtors = allSummaries.map((d) => ({
      asset: d.asset.siteName,
      county: d.asset.county,
      arrears: d.arrearsKES || 0,
      overdueDays: Math.floor(Math.random() * 120), // simulate 0-120 days overdue
    }));

    // Group by buckets
    const agingSummary = buckets.map((b) => {
      const bucketItems = debtors.filter(
        (d) => d.overdueDays > b - 30 && d.overdueDays <= b
      );
      const totalArrears = bucketItems.reduce((sum, d) => sum + d.arrears, 0);
      return { bucket: `${b}-days`, count: bucketItems.length, totalArrears };
    });

    res.json({
      generatedAt: new Date(),
      buckets: agingSummary,
      totalRecords: debtors.length,
    });
  } catch (error) {
    console.error("Error fetching debtors report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
