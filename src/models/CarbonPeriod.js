const mongoose = require("mongoose");

const CarbonPeriodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "2024-H2"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "closed", "upcoming"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarbonPeriod", CarbonPeriodSchema);
