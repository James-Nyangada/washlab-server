const mongoose = require("mongoose");

const CarbonReadinessSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    carbonPeriod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarbonPeriod",
      required: true,
    },
    checklist: {
      projectBoundary: { type: Boolean, default: false },
      waterQuality: { type: Number, default: 0 }, // %
      hygieneSessions: { type: Number, default: 0 },
      dieselShare: { type: Number, default: 0 }, // %
      baselineSurveys: { type: Number, default: 0 },
    },
    readinessScore: {
      type: Number,
      default: 0, // auto-calculated field
    },
    comments: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarbonReadiness", CarbonReadinessSchema);
