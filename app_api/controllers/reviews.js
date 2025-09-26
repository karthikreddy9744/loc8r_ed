// controllers/reviews.js
const Location = require('../models/location');
const User = require('../models/user');

exports.addReview = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user._id; // comes from JWT

    const location = await Location.findById(locationId);
    if (!location) return res.status(404).json({ message: 'Location not found' });

    const newReview = { rating, reviewText, author: userId };
    location.reviews.push(newReview);

    await location.save();

    // Save reference in User model
    const savedReview = location.reviews[location.reviews.length - 1];
    await User.findByIdAndUpdate(userId, { $push: { reviews: savedReview._id } });

    res.status(201).json({ message: 'Review added', review: savedReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding review' });
  }
};