const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String },  // For group chats
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
});

module.exports = mongoose.model('Chat', chatSchema);