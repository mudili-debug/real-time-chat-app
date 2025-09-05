const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // ⬅️ Add this
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join', async ({ userId }) => {
    await User.findByIdAndUpdate(userId, { online: true });
    socket.userId = userId;
    io.emit('onlineStatus', { userId, online: true });
  });

  socket.on('sendMessage', async ({ chatId, content, senderId, file }) => {
    const message = new Message({ sender: senderId, content, file, chat: chatId });
    await message.save();
    io.to(chatId).emit('message', message);
  });

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { online: false });
      io.emit('onlineStatus', { userId: socket.userId, online: false });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
