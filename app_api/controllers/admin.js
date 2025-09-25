const User = require('../models/user');

// Middleware to check admin
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};

// Add new admin
exports.addAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const newAdmin = new User({ username, password, role: 'admin' });
    await newAdmin.save();

    res.json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create admin', error: err });
  }
};