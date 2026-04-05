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
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
