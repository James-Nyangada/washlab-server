const mongoose = require("mongoose");

const WaterQualitySampleSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    sampleDate: { type: Date, required: true },
    collectedBy: { type: String },
    parameters: {
      eColiCount: { type: Number, default: 0 },
      turbidity: { type: Number, default: 0 },
      chlorineResidual: { type: Number, default: 0 },
      ph: { type: Number, default: 7.0 },
    },
    resultStatus: {
      type: String,
      enum: ["pass", "fail", "warning"],
      default: "pass",
    },
    labName: { type: String },
    reportFile: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WaterQualitySample", WaterQualitySampleSchema);
