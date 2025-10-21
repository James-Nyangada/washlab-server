const mongoose = require("mongoose");

const HygieneSessionSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    sessionDate: { type: Date, required: true },
    trainerName: { type: String },
    location: { type: String },
    participants: {
      men: { type: Number, default: 0 },
      women: { type: Number, default: 0 },
      youth: { type: Number, default: 0 },
    },
    topicsCovered: [String],
    photos: [String],
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HygieneSession", HygieneSessionSchema);
