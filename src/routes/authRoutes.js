const express = require('express')
const {register, login, verifyEmail, resendVerificationCode} = require('../controllers/authController');

const router = express.Router  ();

router.post("/register", register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);

module.exports = router; 