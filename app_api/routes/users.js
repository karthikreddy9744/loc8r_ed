// routes/users.js
const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');


router.post('/register', usersCtrl.register);
router.post('/login', usersCtrl.login);
router.get('/profile', requireAuth, usersCtrl.profile);
router.put('/profile', requireAuth, usersCtrl.updateProfile);
router.post('/profile/avatar', requireAuth, upload.single('avatar'), usersCtrl.updateAvatar);
module.exports = router;