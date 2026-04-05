const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiftly')
  .then(async () => {
    const existing = await User.findOne({ email: 'admin@swiftly.com' });
    if (existing) {
      console.log('Admin already exists.');
      process.exit();
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Super Admin',
      email: 'admin@swiftly.com',
      password,
      role: 'admin',
      phone: '0000000000'
    });
    console.log('Super Admin Seeded: admin@swiftly.com / admin123');
    process.exit();
  });
