// models/alertModel.js
const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Drought", "Flood", "Quality"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["Critical", "Warning", "Watch"],
      required: true,
    },
    metric: {
      type: String,
      required: true,
    },
    county: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: String, // Example: "3 days"
    },
    status: {
      type: String,
      enum: ["Active", "Resolved"],
      default: "Active",
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
