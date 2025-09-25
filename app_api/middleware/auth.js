// app_api/middleware/auth.js

const jwt = require('jsonwebtoken');

// Verify the JWT token and set req.user
exports.verifyUser = function(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    req.user = decoded; // decoded should contain username and role
    next();
  });
};

// Check if the user is an admin  
exports.requireAdmin = function (req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next(); // user is admin, allow access
  } else {
    res.status(403).json({ message: 'Forbidden: Admins only' });
  }
};

exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};