const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, requestOTP, resetByOTP, verifyRegistration } = require('../controllers/authController');
const protect = require('../middleware/auth');

// Health Check for Deployment Verification
router.get('/health', (req, res) => res.json({ version: '1.0.1', isPhoneOnly: true }));

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOTP);
router.post('/reset-password', resetByOTP);
router.post('/verify-registration', verifyRegistration);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
