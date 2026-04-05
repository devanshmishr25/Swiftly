require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Message = require('./models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swiftly';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('🔗 Connected to DB...');
    const bResult = await Booking.deleteMany({});
    console.log(`✅ Deleted ${bResult.deletedCount} Bookings.`);
    
    const mResult = await Message.deleteMany({});
    console.log(`✅ Deleted ${mResult.deletedCount} Messages.`);
    
    mongoose.connection.close();
    console.log('👋 Database connection closed.');
  })
  .catch(err => {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  });
