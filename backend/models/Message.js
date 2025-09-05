const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String },
  file: { type: String },  // Path to uploaded file
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);