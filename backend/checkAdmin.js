const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, default: '' },
  password: String, role: { type: String, default: 'customer' },
  phone: String, isApproved: Boolean, isVerified: Boolean,
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

async function checkAndFix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Find all admins
  const admins = await User.find({ role: 'admin' });
  console.log(`Found ${admins.length} admin account(s):`);
  admins.forEach(a => {
    console.log(`  - Name: ${a.name}, Email: "${a.email}", Phone: ${a.phone}, isVerified: ${a.isVerified}`);
  });

  // Delete all and recreate
  await User.deleteMany({ role: 'admin' });
  console.log('\nDeleted all old admins. Creating fresh one...');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Admin@123', salt);

  const admin = new User({
    name: 'Super Admin',
    email: 'admin@swiftly.local',
    phone: '+910000000000',
    password: hash,
    role: 'admin',
    isVerified: true,
    isApproved: true,
  });
  await admin.save();
  
  // Verify password works
  const test = await User.findOne({ email: 'admin@swiftly.local' });
  const ok = await bcrypt.compare('Admin@123', test.password);
  
  console.log('\n✅ Admin created!');
  console.log('   Email    : admin@swiftly.local');
  console.log('   Password : Admin@123');
  console.log(`   Password check: ${ok ? '✅ CORRECT' : '❌ WRONG'}`);
  console.log('   isVerified :', test.isVerified);
  
  await mongoose.disconnect();
}

checkAndFix().catch(e => { console.error(e); process.exit(1); });
