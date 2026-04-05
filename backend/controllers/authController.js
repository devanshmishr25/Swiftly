const User = require('../models/User');
const Service = require('../models/Service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, category } = req.body;

    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    if (role === 'provider') {
      if (!category) return res.status(400).json({ message: 'Service category is required for providers' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone,
      location: location || "Not provided",
      category: role === 'provider' ? category : "",
      isApproved: role === 'provider' ? false : true
    });

    await user.save();

    // Automatically generate the associated Service Document for Providers
    if (user.role === 'provider') {
      const newService = new Service({
        title: `${name}'s ${category} Service`,
        description: `Professional ${category} services delivered efficiently to your doorstep.`,
        category: category,
        provider: user._id,
        price: 0 // Price removed
      });
      await newService.save();
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, name, email, role: user.role, isApproved: user.isApproved } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile & categories
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, category } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (location) updateFields.location = location;
    if (category) updateFields.category = category;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    // SYNC SERVICES: For providers, manage Service documents
    if (user.role === 'provider' && category) {
      // Remove other services (Single service model)
      await Service.deleteMany({ provider: user._id, category: { $ne: category } });

      // Add/Update the single service
      await Service.findOneAndUpdate(
        { provider: user._id, category: category },
        { 
          title: `${user.name}'s ${category} Service`,
          description: `Professional ${category} services available instantly.`,
          price: 0
        },
        { upsert: true, new: true }
      );
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
