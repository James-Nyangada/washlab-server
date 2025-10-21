const express = require("express");
const router = express.Router();
const carbonController = require("../controllers/carbonController");

// Carbon Module
router.get("/carbon/readiness", carbonController.getCarbonReadiness);
router.get("/carbon/periods", carbonController.getCarbonPeriods);
router.get("/carbon/evidence-export", carbonController.getEvidenceExport);

module.exports = router;
