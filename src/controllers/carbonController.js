// controllers/carbonController.js
const CarbonReadiness = require("../models/CarbonReadiness");
const CarbonPeriod = require("../models/CarbonPeriod");
const Asset = require("../models/Asset");
const JSZip = require("jszip");
const { Parser } = require("json2csv");
const axios = require("axios");

// @desc Get readiness checklist summary across all assets
exports.getCarbonReadiness = async (req, res) => {
  try {
    const readinessRecords = await CarbonReadiness.find()
      .populate("asset", "siteName county")
      .populate("carbonPeriod", "name status startDate endDate")
      .sort({ createdAt: -1 });

    const summary = readinessRecords.map((r) => {
      const {
        projectBoundary,
        waterQuality,
        hygieneSessions,
        dieselShare,
        baselineSurveys,
      } = r.checklist;

      const score =
        (projectBoundary ? 20 : 0) +
        (waterQuality >= 90 ? 20 : 0) +
        (hygieneSessions >= 10 ? 20 : 0) +
        (dieselShare < 10 ? 20 : 0) +
        (baselineSurveys >= 5 ? 20 : 0);

      return {
        asset: r.asset.siteName,
        county: r.asset.county,
        carbonPeriod: r.carbonPeriod.name,
        readinessScore: score,
        checklist: r.checklist,
        comments: r.comments,
        updatedAt: r.updatedAt,
      };
    });

    const averageScore =
      summary.reduce((acc, s) => acc + s.readinessScore, 0) /
      (summary.length || 1);

    res.json({
      totalAssets: summary.length,
      averageScore: Number(averageScore.toFixed(1)),
      records: summary,
    });
  } catch (error) {
    console.error("Error fetching carbon readiness:", error);
    res.status(500).json({ message: "Error fetching carbon readiness", error: error.message });
  }
};

// @desc Get carbon monitoring/reporting periods
exports.getCarbonPeriods = async (req, res) => {
  try {
    const periods = await CarbonPeriod.find()
      .sort({ startDate: -1 })
      .lean();

    res.json(periods);
  } catch (error) {
    console.error("Error fetching carbon periods:", error);
    res.status(500).json({ message: "Error fetching periods", error: error.message });
  }
};

// @desc Generate evidence export bundle (CSV + Cloudinary PDF references)
exports.getEvidenceExport = async (req, res) => {
  try {
    const readinessRecords = await CarbonReadiness.find()
      .populate("asset", "siteName county")
      .populate("carbonPeriod", "name");

    if (!readinessRecords.length)
      return res.status(404).json({ message: "No readiness data available" });

    // Generate CSV of readiness data
    const csvFields = [
      "asset",
      "county",
      "carbonPeriod",
      "projectBoundary",
      "waterQuality",
      "hygieneSessions",
      "dieselShare",
      "baselineSurveys",
      "readinessScore",
    ];

    const csvData = readinessRecords.map((r) => {
      const { projectBoundary, waterQuality, hygieneSessions, dieselShare, baselineSurveys } = r.checklist;
      const score =
        (projectBoundary ? 20 : 0) +
        (waterQuality >= 90 ? 20 : 0) +
        (hygieneSessions >= 10 ? 20 : 0) +
        (dieselShare < 10 ? 20 : 0) +
        (baselineSurveys >= 5 ? 20 : 0);
      return {
        asset: r.asset.siteName,
        county: r.asset.county,
        carbonPeriod: r.carbonPeriod.name,
        projectBoundary,
        waterQuality,
        hygieneSessions,
        dieselShare,
        baselineSurveys,
        readinessScore: score,
      };
    });

    const parser = new Parser({ fields: csvFields });
    const csvContent = parser.parse(csvData);

    // Build ZIP file
    const zip = new JSZip();
    zip.file("carbon_readiness.csv", csvContent);

    // Optionally include evidence PDFs if Cloudinary URLs are available
    const docs = readinessRecords
      .filter((r) => r.comments && r.comments.includes("cloudinary"))
      .map((r) => r.comments.match(/https?:\/\/[^\s]+/g))
      .flat()
      .filter(Boolean);

    // Download and attach evidence docs
    for (const url of docs) {
      try {
        const fileResponse = await axios.get(url, { responseType: "arraybuffer" });
        const filename = url.split("/").pop().split("?")[0];
        zip.file(`evidence/${filename}`, fileResponse.data);
      } catch (e) {
        console.warn("Could not download evidence:", url);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=evidence_bundle.zip",
    });
    res.send(zipBuffer);
  } catch (error) {
    console.error("Error generating evidence export:", error);
    res.status(500).json({ message: "Error exporting evidence", error: error.message });
  }
};
