const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { requireAuth } = require('../middleware/auth');

router.post('/add', requireAuth, adminController.requireAdmin, adminController.addAdmin);

module.exports = router;