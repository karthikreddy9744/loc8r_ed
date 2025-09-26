const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // optional if you want hashed passwords
const path = require('path');
const upload = require('../middleware/upload'); // multer middleware




exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Sign JWT with role info
    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
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

// controllers/users.js
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let avatar = null;
    if (user.avatar && user.avatar.data) {
      avatar = `data:${user.avatar.contentType};base64,${user.avatar.data.toString('base64')}`;
    }
    res.json({ ...user.toObject(), avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
// In controllers/users.js
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Add bio here
    const { name, email, address, phone, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (address) updates.address = address;
    if (phone) updates.phone = phone;
    if (bio) updates.bio = bio;   // <-- this line added

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
// UPDATE AVATAR
// controllers/users.js
exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    user.avatar.data = req.file.buffer;
    user.avatar.contentType = req.file.mimetype;

    await user.save();
    res.json({ message: 'Avatar updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};