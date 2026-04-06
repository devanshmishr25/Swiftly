const User = require('../models/User');
const Service = require('../models/Service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to normalize phone numbers (remove spaces, ensure strict format)
const sanitizePhone = (phone) => {
  if (!phone) return "";
  return phone.replace(/\s+/g, '').trim();
};

exports.register = async (req, res) => {
  try {
    let { name, phone, password, role, location, category } = req.body;
    phone = sanitizePhone(phone);

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, Phone, and Password are required' });
    }

    if (role === 'provider' && !category) {
      return res.status(400).json({ message: 'Service category is required for providers' });
    }

    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Check if Firebase already verified this phone on the frontend
    const isAutoVerified = req.body.isAutoVerified === true;
    const otp = isAutoVerified ? null : Math.floor(100000 + Math.random() * 900000).toString();
    
    const placeholderEmail = `user_${phone.replace('+', '')}@swiftly.local`;

    user = new User({
      name,
      email: placeholderEmail,
      password: hashedPassword,
      role: role || 'customer',
      phone,
      location: location || "Not provided",
      category: role === 'provider' ? category : "",
      isApproved: role === 'provider' ? false : true,
      isVerified: isAutoVerified, // Grant immediate access if verified by Firebase
      phoneOTP: otp,
      phoneOTPExpires: isAutoVerified ? null : Date.now() + 30 * 60 * 1000
    });

    await user.save();

    console.log(`[SWIFTLY FREE SMS VERIFY] Registration OTP for ${phone}: ${otp}`);

    if (user.role === 'provider') {
      const newService = new Service({
        title: `${name}'s ${category} Service`,
        description: `Professional ${category} services delivered efficiently to your doorstep.`,
        category: category,
        provider: user._id,
        price: 0
      });
      await newService.save();
    }

    res.status(201).json({ 
       message: 'Account created! Please verify your mobile phone using the OTP.',
       userId: user.id
    });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err.message);
    if (err.code === 11000) {
       return res.status(400).json({ message: 'Mobile number or email already in use.' });
    }
    res.status(500).json({ message: 'Server error during registration', detail: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Phone and password are required' });
    }

    // Search by email OR phone
    const cleanPhone = identifier.replace(/\s+/g, '');
    const user = await User.findOne({ 
       $or: [ 
         { email: identifier.toLowerCase() }, 
         { phone: cleanPhone },
         { phone: identifier }
       ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, isApproved: user.isApproved } });
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

exports.updateProfile = async (req, res) => {
  try {
    let { name, phone, location, category } = req.body;
    if (phone) phone = sanitizePhone(phone);
    
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

    if (user.role === 'provider' && category) {
      await Service.deleteMany({ provider: user._id, category: { $ne: category } });
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

exports.requestOTP = async (req, res) => {
  try {
    let { phone } = req.body;
    phone = sanitizePhone(phone);
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User with this phone number not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[SWIFTLY FREE SMS MOCK] OTP for Reset to ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully to your mobile number (Mocked in Console)' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.resetByOTP = async (req, res) => {
  try {
    let { phone, otp, newPassword } = req.body;
    phone = sanitizePhone(phone);
    if (!phone || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ 
      phone, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.verifyRegistration = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'User ID and OTP required' });

    const user = await User.findOne({ 
      _id: userId,
      phoneOTP: otp,
      phoneOTPExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.phoneOTP = null;
    user.phoneOTPExpires = null;
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, isApproved: user.isApproved, isVerified: user.isVerified } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
