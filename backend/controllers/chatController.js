const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

exports.uploadFile = upload.single('file');

exports.createChat = async (req, res) => {
  const { userId, isGroup, name, users } = req.body;
  try {
    let chat;
    if (isGroup) {
      chat = new Chat({ isGroup: true, name, users: [...users, req.user.id] });
    } else {
      chat = new Chat({ users: [req.user.id, userId] });
    }
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user.id }).populate('users', '-password').populate('latestMessage');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { content, chatId, file } = req.body;
  try {
    const message = new Message({
      sender: req.user.id,
      content,
      file: req.file ? req.file.path : null,
      chat: chatId,
    });
    await message.save();
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId }).populate('sender', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};