const User = require('../models/User');
const Service = require('../models/Service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, phone, password, role, location, category } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, Phone, and Password are required' });
    }

    if (role === 'provider') {
      if (!category) return res.status(400).json({ message: 'Service category is required for providers' });
    }

    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP for Phone Verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Use phone as a placeholder for email to satisfy legacy DB unique indexes if they exist
    const placeholderEmail = `user_${phone.replace(/\s+/g, '')}@swiftly.local`;

    user = new User({
      name,
      email: placeholderEmail, // Placeholder to satisfy DB constraints
      password: hashedPassword,
      role: role || 'customer',
      phone,
      location: location || "Not provided",
      category: role === 'provider' ? category : "",
      isApproved: role === 'provider' ? false : true,
      isVerified: false, 
      phoneOTP: otp,
      phoneOTPExpires: Date.now() + 30 * 60 * 1000 // 30 mins
    });

    await user.save();

    // MOCK SMS LOG (FREE)
    console.log(`[SWIFTLY FREE SMS VERIFY] Registration OTP for ${phone}: ${otp}`);

    // Automatically generate the associated Service Document for Providers
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
       return res.status(400).json({ message: 'Mobile number or email already in use by another account.' });
    }
    res.status(500).json({ message: 'Server error during registration', detail: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    if (user.isVerified === false) {
      return res.status(401).json({ 
        message: 'Mobile number not verified! Please complete verification via the OTP sent at registration.',
        userId: user.id 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
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

// @desc    Request Password Reset OTP
// @route   POST /api/auth/request-otp
exports.requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User with this phone number not found' });

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    // MOCK SMS SERVICE (LOG TO CONSOLE - FREE)
    console.log(`[SWIFTLY FREE SMS MOCK] OTP for Reset to ${phone}: ${otp}`);
    
    // In a real app, you would call an SMS API here like Fast2SMS, Twilio, etc.
    // For now, we simulate success.
    res.json({ message: 'OTP sent successfully to your mobile number (Mocked in Console)' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
exports.resetByOTP = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ 
      phone, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP fields
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-registration
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

    // Mark as verified
    user.isVerified = true;
    user.phoneOTP = null;
    user.phoneOTPExpires = null;
    await user.save();

    // Now generate login token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, isVerified: user.isVerified } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
