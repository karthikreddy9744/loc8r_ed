// --- Load environment & connect DB ---
require('dotenv').config();
require('./app_api/models/db');   // must come first to register models

// --- Core modules ---
const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const logger       = require('morgan');

// --- Routes ---
const apiRoutes = require('./app_api/routes/index');     // API routes
const usersRoutes = require('./app_api/routes/users');
const adminRoutes = require('./app_api/routes/admin');
// --- Init app ---
const app = express();


// --- Middleware ---
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Static assets ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store'); // disable caching
  next();
});
// --- API endpoints ---
app.use('/api', usersRoutes);
app.use('/api', apiRoutes);
app.use('/api', adminRoutes);

// --- Angular fallback ---
// For any other route, send Angular index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});

// --- Export ---
module.exports = app;