const User = require('../models/User');

const adminGuard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Super Admin only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server Error in admin check' });
  }
};

module.exports = adminGuard;
