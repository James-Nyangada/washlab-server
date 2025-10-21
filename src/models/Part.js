const mongoose = require("mongoose");

const PartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    partNumber: { type: String, unique: true, trim: true },
    category: {
      type: String,
      enum: ["pump", "panel", "pipe", "sensor", "other"],
      default: "other",
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    vendor: {
      type: String,
    },
    priceKES: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["available", "out_of_stock", "ordered"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Part", PartSchema);
