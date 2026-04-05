const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const adminGuard = require('../middleware/admin');
const adminController = require('../controllers/adminController');

router.use(protect, adminGuard);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.get('/pending', adminController.getPendingProviders);
router.put('/approve/:id', adminController.approveProvider);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/users/:id/bookings', adminController.clearUserBookings);

module.exports = router;
