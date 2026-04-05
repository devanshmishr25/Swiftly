const Booking = require('../models/Booking');
const Message = require('../models/Message');
const socketUtils = require('../utils/socket');

// @desc    Create a new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { service, provider, scheduledDate, notes, totalPrice } = req.body;
    
    // Security: Use the authenticated user ID as the customer ID
    const customer = req.user.id;

    const newBooking = new Booking({
      service,
      customer,
      provider,
      scheduledDate,
      totalPrice,
      notes
    });

    const booking = await newBooking.save();
    
    // Emit real-time notification to the provider
    try {
      const io = socketUtils.getIO();
      io.to(provider.toString()).emit('new_booking', {
        message: 'New job request received!',
        bookingId: booking._id
      });
    } catch (socketErr) {
      console.warn('Socket emit failed, but booking was saved:', socketErr.message);
    }

    res.status(201).json(booking);
  } catch (err) {
    // 500 Error catch-all with detail
    console.error('CRITICAL BOOKING ERROR:', {
      message: err.message,
      body: req.body,
      user: req.user?.id,
      stack: err.stack
    });

    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid booking data. Please check your selection.', 
        details: err.errors || err.message 
      });
    }
    
    res.status(500).send('Internal Server Error');
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/:userId
exports.getUserBookings = async (req, res) => {
  try {
    const { role } = req.query; // 'customer' or 'provider'
    
    let query = {};
    if (role === 'provider') {
      query.provider = req.user.id;
    } else {
      query.customer = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'title category price')
      .populate('customer', 'name email phone location')
      .populate('provider', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const currentBooking = await Booking.findById(id);
    if (!currentBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // "One Active Job" Algo: Only one accepted/in-progress job at a time
    if (status === 'accepted') {
      const activeBooking = await Booking.findOne({
        provider: currentBooking.provider,
        status: { $in: ['accepted', 'in-progress'] }
      });

      if (activeBooking && activeBooking._id.toString() !== id) {
        return res.status(400).json({ 
          message: 'One Task Policy: You already have an active job. Please complete or cancel your current job before accepting a new one.' 
        });
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    // AUTO-CLEANUP: Delete messages if job is completed or cancelled to save DB space
    if (status === 'completed' || status === 'cancelled') {
       try {
         await Message.deleteMany({ booking: id });
         console.log(`Auto-Cleanup: Purged chat history for booking ${id}`);
       } catch (cleanErr) {
         console.warn('Auto-Cleanup Failed:', cleanErr.message);
       }
    }

    try {
      const io = socketUtils.getIO();
      // Notify both parties of the change dynamically
      io.to(booking.customer.toString()).emit('status_update', {
        message: `Your booking was marked as ${status}!`,
        bookingId: booking._id,
        status: status
      });
      io.to(booking.provider.toString()).emit('status_update', {
        message: `Booking status changed to ${status}`,
        bookingId: booking._id,
        status: status
      });
    } catch (socketErr) {
      console.warn('Socket emit failed for status update:', socketErr.message);
    }

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
