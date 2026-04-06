const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, default: '' },
  password: String,
  role: { type: String, default: 'customer' },
  phone: String,
  location: { type: String, default: 'Not provided' },
  category: { type: String, default: '' },
  isApproved: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function resetAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!');

    // Delete ALL existing admin accounts
    const deleted = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️  Deleted ${deleted.deletedCount} old admin account(s).`);

    // Create fresh admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const admin = new User({
      name: 'Super Admin',
      email: 'admin@swiftly.local',
      phone: '+910000000000',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isApproved: true,
      location: 'HQ'
    });

    await admin.save();
    console.log('');
    console.log('✅ Super Admin created successfully!');
    console.log('   Email    : admin@swiftly.local');
    console.log('   Password : Admin@123');
    console.log('   Phone    : +91 00000 00000');
    console.log('');
    console.log('You can now log in at myswiftly.vercel.app');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetAdmin();
