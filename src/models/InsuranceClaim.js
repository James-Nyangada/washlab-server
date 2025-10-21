const mongoose = require("mongoose");

const InsuranceClaimSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsurancePolicy",
      required: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    claimDate: { type: Date, default: Date.now },
    amountClaimed: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "settled"],
      default: "pending",
    },
    description: {
      type: String,
    },
    documents: [
      {
        type: String,
      },
    ],
    settledAmount: { type: Number },
    settledDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InsuranceClaim", InsuranceClaimSchema);
