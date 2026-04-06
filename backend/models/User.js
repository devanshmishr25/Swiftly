const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    default: ""
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer'
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    default: "Not provided"
  },
  category: {
    type: String,
    default: ""
  },
  isApproved: {
    type: Boolean,
    default: true // Customers and Admin auto-approved
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  phoneOTP: {
    type: String,
    default: null
  },
  phoneOTPExpires: {
    type: Date,
    default: null
  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
