const mongoose = require("mongoose");

const InsurancePolicySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    provider: {
      type: String,
      required: true,
    },
    policyNumber: {
      type: String,
      unique: true,
      required: true,
    },
    coverageType: {
      type: String,
      enum: ["equipment", "liability", "theft", "comprehensive"],
      default: "equipment",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    premiumKES: { type: Number },
    active: { type: Boolean, default: true },
    documents: [
      {
        type: String, // URLs for uploaded policy files
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("InsurancePolicy", InsurancePolicySchema);
