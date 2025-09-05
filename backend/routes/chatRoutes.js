const express = require('express');
const jwt = require('jsonwebtoken');
const {
  createChat,
  getChats,
  sendMessage,
  getMessages,
  uploadFile,
} = require('../controllers/chatController');

const router = express.Router();

// 🔒 Middleware to protect routes with JWT
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 🗨️ Chat routes
router.post('/chat', protect, createChat);          // Create new chat
router.get('/chats', protect, getChats);            // Get all chats for user
router.post('/message', protect, uploadFile, sendMessage); // Send message with optional file
router.get('/messages/:chatId', protect, getMessages);     // Get messages for a chat

module.exports = router;
