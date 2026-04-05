const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Message = require('../models/Message');

exports.getStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const acceptedBookings = await Booking.countDocuments({ status: 'accepted' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    const pendingJoinings = await User.countDocuments({ role: 'provider', isApproved: false });

    res.json({
      users: { customer: totalCustomers, provider: totalProviders },
      pendingJoinings,
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        accepted: acceptedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user is not admin
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });

    // Cleanup resources
    await Service.deleteMany({ provider: id });
    await Booking.deleteMany({ $or: [{ customer: id }, { provider: id }] });
    await Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] });
    
    await User.findByIdAndDelete(id);

    res.json({ message: 'User and all related data deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.clearUserBookings = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user exists and is not admin
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify admin bookings' });

    // Delete only bookings and related messages
    await Booking.deleteMany({ $or: [{ customer: id }, { provider: id }] });
    // Note: We'll delete messages linked to these bookings, or just global messages for this user
    await Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] });

    res.json({ message: 'All bookings and chat history cleared for this user' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.getPendingProviders = async (req, res) => {
  try {
    const pending = await User.find({ role: 'provider', isApproved: false }).select('-password').sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.approveProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: `${user.name} has been approved as a service provider!` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
