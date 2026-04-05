const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/messageController');
const protect = require('../middleware/auth');

// @route   GET /api/messages/:bookingId
// @desc    Get chat history for a specific booking
// @access  Private
router.get('/:bookingId', protect, getChatHistory);

module.exports = router;
