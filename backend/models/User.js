const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
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
    required: true
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
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
