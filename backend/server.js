// Force Deploy Timestamp: 2026-04-06T10:43:00Z
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketUtils = require('./utils/socket');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health Check for Deployment Verification
app.get('/api/auth/health', (req, res) => res.json({ version: '1.0.2', isPhoneOnly: false, timestamp: '2026-04-06T11:32:00Z' }));

const server = http.createServer(app);
const io = socketUtils.init(server);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const Message = require('./models/Message');

// Socket connection logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room.`);
  });

  socket.on('send_message', async (data) => {
    const { sender, recipient, booking, text } = data;
    try {
      const newMessage = new Message({ sender, recipient, booking, text });
      await newMessage.save();

      io.to(recipient).emit('receive_message', {
        sender,
        booking,
        text,
        createdAt: newMessage.createdAt
      });
    } catch (err) {
      console.error('Socket Message Error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/service');
const bookingRoutes = require('./routes/booking');
const messageRoutes = require('./routes/message');
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Swiftly API is running...');
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      seedAdmin();
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Auto-Seed function for Super Admin
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('--- SEEDING SUPER ADMIN ---');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      const admin = new User({
        name: 'Super Admin',
        phone: '+910000000000', 
        email: 'admin@swiftly.local',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('✅ Super Admin account seeded successfully!');
    } else {
      console.log('✅ Admin account already exists.');
    }
  } catch (err) {
    console.warn('Admin Seeding Warning:', err.message);
  }
};
