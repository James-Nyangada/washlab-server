const express = require("express");
const router = express.Router();
const hygieneController = require("../controllers/hygieneController");
const multer = require("multer");

// Use memory storage for buffer uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Hygiene Sessions
router.post(
  "/hygiene/sessions",
  upload.array("photos"), // Multiple photos upload
  hygieneController.createSession
);
router.get("/hygiene/sessions", hygieneController.getSessions);

module.exports = router;
