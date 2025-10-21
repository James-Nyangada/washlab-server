const express = require("express");
const multer = require("multer");
const {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController.js");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// CRUD routes
router.post("/", upload.array("images"), createTestimonial);
router.get("/", getTestimonials);
router.get("/approved", require("../controllers/testimonialController").getApprovedTestimonials);
router.patch("/:id/status", require("../controllers/testimonialController").updateTestimonialStatus);
router.get("/:id", getTestimonialById);
router.put("/:id", upload.array("images"), updateTestimonial);
router.delete("/:id", deleteTestimonial);

module.exports = router;
