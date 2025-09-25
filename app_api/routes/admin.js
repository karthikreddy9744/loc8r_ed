const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { requireAuth } = require('../middleware/auth');

// Only authenticated admins can add a new admin
router.post(
  '/admin/add', 
  requireAuth,                // checks JWT
  adminController.requireAdmin, // checks role === 'admin'
  adminController.addAdmin    // creates new admin
);

module.exports = router;