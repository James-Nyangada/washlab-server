const express = require("express");
const router = express.Router();
const waterQualityController = require("../controllers/waterQualityController");
const multer = require("multer");

// Use memory storage for buffer uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Water Quality Routes
router.post(
  "/water-quality/samples",
  upload.single("file"), // Single file upload (PDF/image)
  waterQualityController.createSample
);
router.get("/water-quality/samples", waterQualityController.getSamples);

module.exports = router;
