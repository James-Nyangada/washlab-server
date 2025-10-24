const express = require('express')
const {register, login, verifyEmail, resendVerificationCode, registerAdmin} = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router  ();

router.post("/register", register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);

// Admin registration route - only super-admin can create users without verification
router.post('/register-admin', verifyToken, authorizeRoles("super-admin"), registerAdmin);

module.exports = router; 