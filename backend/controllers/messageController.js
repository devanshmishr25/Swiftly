const Message = require('../models/Message');

// @desc    Get chat history for a specific booking
// @route   GET /api/messages/:bookingId
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({ booking: req.params.bookingId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name');
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
