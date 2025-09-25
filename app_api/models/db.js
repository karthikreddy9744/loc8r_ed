// app_api/models/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load env vars from .env

// --- MongoDB Atlas connection string ---
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("❌ ERROR: No MongoDB connection string found in .env file");
  process.exit(1);
}

// --- Connect ---
mongoose.connect(dbURI)
  .then(() => console.log(`✅ Mongoose connected to ${dbURI}`))
  .catch(err => console.error('❌ Mongoose connection error:', err));

// --- Events ---
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected');
});

// --- Graceful Shutdown ---
const gracefulShutdown = async (msg) => {
  try {
    await mongoose.connection.close();
    console.log(`🔌 Mongoose disconnected through ${msg}`);
  } catch (err) {
    console.error('Error during disconnection:', err);
  }
};

// For nodemon restarts
process.once('SIGUSR2', async () => {
  await gracefulShutdown('nodemon restart');
  process.kill(process.pid, 'SIGUSR2');
});

// For app termination
process.on('SIGINT', async () => {
  await gracefulShutdown('app termination');
  process.exit(0);
});

// For Heroku or other platform shutdown
process.on('SIGTERM', async () => {
  await gracefulShutdown('Heroku app shutdown');
  process.exit(0);
});

// --- Load models ---
require('./location');
// require('./user');