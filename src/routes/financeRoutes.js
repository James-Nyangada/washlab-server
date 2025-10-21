const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

// Finance
router.get("/finance/summary", financeController.getFinanceSummary);
router.get("/finance/debtors", financeController.getDebtors);

module.exports = router;
