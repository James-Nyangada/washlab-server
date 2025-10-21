const express = require("express");
const { initiateSTKPush, handleCallback, checkPaymentStatus } = require("../controllers/mpesaController");

const router = express.Router();

router.post("/stkpush", initiateSTKPush);
router.post("/callback", handleCallback);
router.get("/check-payment/:bookingId", checkPaymentStatus);

module.exports = router;
