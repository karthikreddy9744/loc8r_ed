// seed.js
require('dotenv').config();
const mongoose = require('mongoose');

// Load DB connection + Location model
require('./app_api/models/location');
const Location = mongoose.model('Location');

// Helper: GeoJSON coords
const buildGeoJSON = (lat, lng) => ({
  type: 'Point',
  coordinates: [parseFloat(lng), parseFloat(lat)] // [lng, lat]
});

(async () => {
  try {
    // --- Connect to Atlas ---
    const dbURI = process.env.MONGO_URI;
    if (!dbURI) {
      throw new Error("❌ No MongoDB URI found in .env (MONGO_URI)");
    }

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB Atlas");

    // --- Clear old data ---
    await Location.deleteMany({});
    console.log("🗑 Old locations cleared");

    // --- Insert sample locations ---
    await Location.create([
      {
        name: 'Biryani House',
        address: '12 RTC Cross Road, Hyderabad',
        rating: 4,
        facilities: ['Food', 'Wifi', 'Outdoor seating'],
        coords: buildGeoJSON(17.385044, 78.486671),
        openingTimes: [
          { days: 'Monday - Friday', opening: '7:00am', closing: '7:00pm', closed: false },
          { days: 'Saturday', opening: '8:00am', closing: '5:00pm', closed: false },
          { days: 'Sunday', closed: true }
        ],
        reviews: [
          { author: 'Avinash', rating: 5, reviewText: 'Amazing biryani and great ambiance!' },
          { author: 'Avi', rating: 3, reviewText: 'Good food but a bit crowded.' }
        ]
      },
      {
        name: 'Chai Point',
        address: 'Hitech City, Hyderabad',
        rating: 5,
        facilities: ['Tea', 'Snacks', 'Work-friendly'],
        coords: buildGeoJSON(17.448294, 78.391485),
        openingTimes: [
          { days: 'Monday - Saturday', opening: '9:00am', closing: '9:00pm', closed: false },
          { days: 'Sunday', closed: true }
        ],
        reviews: [
          { author: 'Ravi', rating: 4, reviewText: 'Best tea in the city!' }
        ]
      },
      {
        name: 'Work Cafe',
        address: 'Gachibowli, Hyderabad',
        rating: 3,
        facilities: ['Wifi', 'Coffee', 'Charging Ports'],
        coords: buildGeoJSON(17.4401, 78.3489),
        openingTimes: [
          { days: 'Monday - Friday', opening: '8:00am', closing: '8:00pm', closed: false },
          { days: 'Saturday - Sunday', opening: '10:00am', closing: '6:00pm', closed: false }
        ],
        reviews: [
          { author: 'Sneha', rating: 4, reviewText: 'Nice working atmosphere!' },
          { author: 'Raj', rating: 2, reviewText: 'Wifi is slow at times.' }
        ]
      }
    ]);

    console.log("🌱 Database seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
})();

