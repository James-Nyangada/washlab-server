const express = require("express");
const router = express.Router();
const docsController = require("../controllers/docsController");
const multer = require("multer");

// Use memory storage for file buffer upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Document Management
router.get("/docs/list", docsController.listDocuments);
router.post("/docs/upload", upload.single("file"), docsController.uploadDocument);
router.post("/docs/pin", docsController.pinDocument);

module.exports = router;
