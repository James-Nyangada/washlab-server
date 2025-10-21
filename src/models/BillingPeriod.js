const mongoose = require("mongoose");

const BillingPeriodSchema = new mongoose.Schema(
  {
    periodName: { type: String, required: true }, // e.g., "2025-Jan"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BillingPeriod", BillingPeriodSchema);
