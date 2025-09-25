// /routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const usersCtrl = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');
// /api/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Always assign default role 'user'
    const newUser = new User({ username, password, role: 'user' });
    await newUser.save();

    res.json({ message: 'Registration successful. Please login.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Registration failed' });
  }
});
// /api/login
router.post('/login', usersCtrl.login);
// /api/profile


module.exports = router;