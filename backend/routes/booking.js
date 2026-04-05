const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, updateBookingStatus } = require('../controllers/bookingController');
const protect = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
