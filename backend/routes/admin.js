const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const adminGuard = require('../middleware/admin');
const adminController = require('../controllers/adminController');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ⚡ PUBLIC one-time reset route - no auth needed
// Deletes ALL admin accounts and creates a fresh Super Admin
router.post('/reset-superadmin', async (req, res) => {
  try {
    // Delete all existing admin accounts
    await User.deleteMany({ role: 'admin' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@swiftly.local',
      phone: '+910000000000',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isApproved: true,
      location: 'HQ'
    });
    
    await admin.save();
    res.json({ 
      success: true, 
      message: '✅ Super Admin reset successfully!',
      credentials: { email: 'admin@swiftly.local', password: 'Admin@123' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.use(protect, adminGuard);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.get('/pending', adminController.getPendingProviders);
router.put('/approve/:id', adminController.approveProvider);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/users/:id/bookings', adminController.clearUserBookings);

module.exports = router;
