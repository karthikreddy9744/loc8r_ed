const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // optional if you want hashed passwords


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Sign JWT with role info
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Role is ALWAYS 'user' here
    const user = new User({ username, password, role: 'user' });
    await user.save();

    res.json({ message: 'Registration successful. Please login.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Registration failed', error: err });
  }
};