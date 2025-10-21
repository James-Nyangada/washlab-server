/**
 * seedDatabase.js
 *
 * Robust seeder for WASHLAB (matches the Mongoose schemas used earlier in this project).
 * - Clears listed collections
 * - Inserts Assets, Telemetry, Tickets, Parts, Insurance, Billing, WaterQuality, Hygiene, Carbon records
 * - Prints helpful validation errors if any model validation still fails
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const dbConnect = require("../config/dbConnect");

// models (adjust paths if your project structure differs)
const Asset = require("../models/Asset");
const Telemetry = require("../models/Telemetry");
const Ticket = require("../models/Ticket");
const Part = require("../models/Part");
const InsurancePolicy = require("../models/InsurancePolicy");
const InsuranceClaim = require("../models/InsuranceClaim");
const BillingPeriod = require("../models/BillingPeriod");
const BillingSummary = require("../models/BillingSummary");
const WaterQualitySample = require("../models/WaterQualitySample");
const HygieneSession = require("../models/HygieneSession");
const CarbonPeriod = require("../models/CarbonPeriod");
const CarbonReadiness = require("../models/CarbonReadiness");
const Alert = require("../models/alertModel");


async function clearCollections() {
  const models = [
    Asset,
    Telemetry,
    Ticket,
    Part,
    InsurancePolicy,
    InsuranceClaim,
    BillingPeriod,
    BillingSummary,
    WaterQualitySample,
    HygieneSession,
    CarbonPeriod,
    CarbonReadiness,
    Alert,
  ];

  for (const m of models) {
    try {
      await m.deleteMany({});
    } catch (e) {
      // ignore if collection doesn't exist yet
    }
  }
}

function printValidationError(err) {
  if (err && err.name === "ValidationError") {
    console.error("Validation errors:");
    for (const [path, vErr] of Object.entries(err.errors || {})) {
      console.error(` - ${path}: ${vErr.message}`);
    }
  } else {
    console.error(err);
  }
}

async function seed() {
  try {
    // 1. Connect to DB
    await dbConnect();
    console.log("🌍 Connected to MongoDB. Clearing old data...");

    await clearCollections();
    console.log("🧹 Old collections cleared.");

    // 2. Create Assets
    const assets = await Asset.insertMany([
      {
        schemeCode: "NRB-001",
        siteName: "Nairobi Central Pump Station",
        gps: { lat: -1.286389, lng: 36.817223 },
        county: "Nairobi",
        subCounty: "Central",
        status: "active", // ensure this matches your enum
        energySource: "solar",
        capacity_m3_day: 150,
        operator: "Nairobi Water Co.",
        installationDate: new Date("2021-03-15"),
      },
      {
        schemeCode: "KSM-002",
        siteName: "Kisumu West Treatment Plant",
        gps: { lat: -0.091702, lng: 34.767956 },
        county: "Kisumu",
        subCounty: "West",
        status: "active",
        energySource: "diesel",
        capacity_m3_day: 120,
        operator: "Kisumu Water Ltd",
        installationDate: new Date("2020-08-01"),
      },
      {
        schemeCode: "ELD-003",
        siteName: "Eldoret North Borehole",
        gps: { lat: 0.514277, lng: 35.269779 },
        county: "Uasin Gishu",
        subCounty: "North",
        status: "maintenance", // avoid 'fault' vs 'faulty' mismatch; set to maintenance if unsure
        energySource: "hybrid",
        capacity_m3_day: 60,
        operator: "Uasin Gishu Utilities",
        installationDate: new Date("2019-11-05"),
      },
    ]);
    console.log(`🏗️ Created ${assets.length} assets.`);

    // 3. Telemetry: generate hourly-like telemetry for the last 48 hours for each asset
    const telemetryDocs = [];
    const now = Date.now();
    for (let hour = 0; hour < 48; hour++) {
      const ts = new Date(now - hour * 60 * 60 * 1000);
      for (const a of assets) {
        telemetryDocs.push({
          asset: a._id,
          flowRate: Number((10 + Math.random() * 15).toFixed(2)), // L/s or m3? per your schema
          pressure: Number((2.5 + Math.random() * 2).toFixed(2)),
          turbidity: Number((0.3 + Math.random() * 2).toFixed(2)),
          chlorineResidual: Number((0.4 + Math.random() * 0.8).toFixed(2)),
          energySource: Math.random() > 0.2 ? "solar" : "diesel",
          voltage: Number((220 + Math.random() * 15).toFixed(1)),
          runtimeHours: Number((Math.random() * 24).toFixed(1)),
          signalStrength: -60 + Math.floor(Math.random() * 10),
          createdAt: ts,
          timestamp: ts, // if your model uses 'timestamp'
        });
      }
    }
    await Telemetry.insertMany(telemetryDocs);
    console.log(`📊 Inserted ${telemetryDocs.length} telemetry records.`);

    // 4. Tickets (ensure required 'title' field present)
    const tickets = await Ticket.insertMany([
      {
        asset: assets[2]._id,
        title: "Pump motor failure reported",
        description: "Motor tripped and will not restart - requires onsite inspection",
        category: "mechanical",
        priority: "high",
        status: "open",
        createdBy: "system",
        assignedTo: "Technician A",
      },
      {
        asset: assets[1]._id,
        title: "Low pressure observed in distribution",
        description: "Pressure below threshold intermittently for 6 hours",
        category: "hydraulic",
        priority: "medium",
        status: "in_progress",
        createdBy: "operator@kisumuwater.co.ke",
        assignedTo: "Technician B",
      },
    ]);
    console.log(`🎫 Created ${tickets.length} tickets.`);

    // 5. Parts inventory
    const parts = await Part.insertMany([
      {
        name: "Pump Seal Kit",
        partNumber: "PMP-001",
        category: "pump",
        description: "Seal kit for 5HP borehole pumps",
        stock: 25,
        location: "Nairobi Warehouse",
        vendor: "HydroTech Kenya Ltd",
        priceKES: 4200,
        status: "available",
      },
      {
        name: "Pressure Sensor",
        partNumber: "PRS-002",
        category: "sensor",
        description: "4-20mA pressure sensor",
        stock: 12,
        location: "Kisumu Store",
        vendor: "Sensors Co KE",
        priceKES: 1800,
        status: "available",
      },
    ]);
    console.log(`🔧 Created ${parts.length} spare parts.`);

    // 6. Insurance policies & claims
    const policies = await InsurancePolicy.insertMany([
      {
        asset: assets[0]._id,
        provider: "APA Insurance",
        policyNumber: "APA-2025-0001",
        coverageType: "equipment",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2026-01-01"),
        premiumKES: 50000,
        active: true,
        documents: [],
      },
    ]);
    const claims = await InsuranceClaim.insertMany([
      {
        policy: policies[0]._id,
        asset: assets[2]._id,
        claimDate: new Date(),
        amountClaimed: 75000,
        status: "pending",
        description: "Pump motor failure claim",
        documents: [],
      },
    ]);
    console.log(`🛡️ Added ${policies.length} policy(ies) & ${claims.length} claim(s).`);

    // 7. Billing: create BillingPeriod documents and BillingSummary that reference them
    const bp1 = await BillingPeriod.create({
      periodName: "2025-09",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-09-30"),
      status: "closed",
    });
    const bp2 = await BillingPeriod.create({
      periodName: "2025-10",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-10-31"),
      status: "open",
    });

    await BillingSummary.insertMany([
      {
        asset: assets[0]._id,
        billingPeriod: bp1._id,
        totalBilledKES: 450000,
        totalCollectedKES: 390000,
        collectionEfficiency: 86.67,
        arrearsKES: 60000,
        oAndMCostKES: 320000,
        remarks: "September summary",
      },
      {
        asset: assets[1]._id,
        billingPeriod: bp1._id,
        totalBilledKES: 380000,
        totalCollectedKES: 340000,
        collectionEfficiency: 89.47,
        arrearsKES: 40000,
        oAndMCostKES: 250000,
        remarks: "September summary",
      },
    ]);
    console.log(`💰 Added billing periods and summaries.`);

    // 8. Water quality samples
    await WaterQualitySample.insertMany([
      {
        asset: assets[1]._id,
        sampleDate: new Date(),
        collectedBy: "LabTech A",
        parameters: {
          eColiCount: 0,
          turbidity: 0.8,
          chlorineResidual: 0.7,
          ph: 7.1,
        },
        resultStatus: "pass",
        labName: "Nairobi Water Lab",
        reportFile: "https://res.cloudinary.com/demo/report1.pdf",
      },
    ]);
    console.log(`💧 Inserted water quality sample(s).`);

    // 9. Hygiene sessions
    await HygieneSession.insertMany([
      {
        asset: assets[0]._id,
        sessionDate: new Date(),
        trainerName: "Jane Akinyi",
        location: "Nairobi Central Community Hall",
        participants: { men: 10, women: 14, youth: 6 },
        topicsCovered: ["Handwashing", "Water Storage Hygiene"],
        photos: ["https://res.cloudinary.com/demo/hygiene1.jpg"],
        remarks: "Good turnout",
      },
    ]);
    console.log(`🧼 Inserted hygiene session(s).`);

    // 10. Carbon periods & readiness
    const cp1 = await CarbonPeriod.create({
      name: "2025-H1",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
      status: "active",
    });
    const cp2 = await CarbonPeriod.create({
      name: "2025-H2",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-12-31"),
      status: "upcoming",
    });

    await CarbonReadiness.insertMany([
      {
        asset: assets[0]._id,
        carbonPeriod: cp1._id,
        checklist: {
          projectBoundary: true,
          waterQuality: 95,
          hygieneSessions: 12,
          dieselShare: 8,
          baselineSurveys: 5,
        },
        readinessScore: 88,
        comments: "Ready for submission - evidence attached in docs",
      },
      {
        asset: assets[1]._id,
        carbonPeriod: cp1._id,
        checklist: {
          projectBoundary: true,
          waterQuality: 89,
          hygieneSessions: 8,
          dieselShare: 12,
          baselineSurveys: 3,
        },
        readinessScore: 66,
        comments: "Needs more hygiene sessions & surveys",
      },
    ]);
    console.log(`🌿 Created carbon periods & readiness records.`);

    // 11. Alerts (for Early Warning System)
await Alert.insertMany([
  {
    type: "Drought",
    title: "Drought Warning – Nyando Hub",
    severity: "Warning",
    metric: "Flow ↓ 25%",
    county: "Kisumu",
    duration: "3 days",
    status: "Active",
    coordinates: { lat: -0.0917, lng: 34.768 },
  },
  {
    type: "Flood",
    title: "Flood Risk – Kisumu Hub",
    severity: "Critical",
    metric: "Rainfall ↑ 150mm",
    county: "Kisumu",
    duration: "1 day",
    status: "Active",
    coordinates: { lat: -0.0917, lng: 34.768 },
  },
  {
    type: "Quality",
    title: "Quality Alert – Kakamega Hub",
    severity: "Watch",
    metric: "Turbidity ↑ 12%",
    county: "Kakamega",
    duration: "2 days",
    status: "Active",
    coordinates: { lat: 0.2827, lng: 34.7519 },
  },
  {
    type: "Flood",
    title: "Flood Watch – Homa Bay Hub",
    severity: "Watch",
    metric: "Water Level ↑ 20%",
    county: "Homa Bay",
    duration: "2 days",
    status: "Resolved",
    coordinates: { lat: -0.5273, lng: 34.4571 },
  },
]);

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:");
    printValidationError(err);
    // Print stack for non-validation errors
    if (!err || err.name !== "ValidationError") console.error(err);
    process.exit(1);
  }
}

seed();
