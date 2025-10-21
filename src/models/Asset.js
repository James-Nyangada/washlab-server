const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      trim: true,
    },
    schemeCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    gps: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    county: {
      type: String,
      required: true,
      trim: true,
    },
    subCounty: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "faulty", "maintenance"],
      default: "active",
    },
    energySource: {
      type: String,
      enum: ["solar", "diesel", "hybrid", "grid"],
      default: "solar",
    },
    capacity_m3_day: {
      type: Number,
      default: 0,
    },
    operator: {
      type: String,
      trim: true,
    },
    installationDate: {
      type: Date,
    },
    lastInspection: {
      type: Date,
    },
    images: [
      {
        type: String, // Cloudinary or S3 URLs
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", AssetSchema);
