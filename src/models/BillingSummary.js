const mongoose = require("mongoose");

const BillingSummarySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    billingPeriod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BillingPeriod",
      required: true,
    },
    totalBilledKES: { type: Number, default: 0 },
    totalCollectedKES: { type: Number, default: 0 },
    collectionEfficiency: { type: Number, default: 0 },
    arrearsKES: { type: Number, default: 0 },
    oAndMCostKES: { type: Number, default: 0 },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BillingSummary", BillingSummarySchema);
