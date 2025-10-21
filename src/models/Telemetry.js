const mongoose = require("mongoose");

const TelemetrySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    flowRate: { type: Number, default: 0 }, // L/s
    pressure: { type: Number, default: 0 }, // bar
    turbidity: { type: Number, default: 0 }, // NTU
    chlorineResidual: { type: Number, default: 0 }, // mg/L
    energySource: {
      type: String,
      enum: ["solar", "diesel", "grid", "hybrid"],
      default: "solar",
    },
    voltage: { type: Number },
    runtimeHours: { type: Number },
    signalStrength: { type: Number },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Telemetry", TelemetrySchema);
