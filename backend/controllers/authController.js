const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 👤 Register new user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔑 Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all users (for showing user list)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username email _id'); // return limited fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
