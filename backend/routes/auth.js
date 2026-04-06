const { register, login, getMe, updateProfile, requestOTP, resetByOTP, verifyRegistration } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/request-otp', requestOTP);
router.post('/reset-password', resetByOTP);
router.post('/verify-registration', verifyRegistration);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
