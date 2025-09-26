// app_api/controllers/locations.js
const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

/* ----------------- Helpers ----------------- */

// Validate & build GeoJSON point
const buildGeoJSON = (lat, lng) => {
  const la = parseFloat(lat);
  const lo = parseFloat(lng);
  if (isNaN(la) || isNaN(lo)) return null;
  return { type: 'Point', coordinates: [lo, la] };
};

// Centralized error response
const sendError = (res, status, message, error = null) => {
  console.error(message, error || '');
  return res.status(status).json({ message, error });
};

// Recalculate average rating
const updateAverageRating = (location) => {
  if (location.reviews.length > 0) {
    location.rating =
      location.reviews.reduce((sum, r) => sum + r.rating, 0) /
      location.reviews.length;
  } else {
    location.rating = 0;
  }
};

/* ----------------- Location CRUD ----------------- */

// GET /api/locations
const locationsList = async (req, res) => {
  try {
    const docs = await Loc.find({});
    return res.status(200).json(docs);
  } catch (err) {
    return sendError(res, 500, 'Error fetching locations', err);
  }
};

// POST /api/locations
const locationsCreate = async (req, res) => {
  try {
    const coords = buildGeoJSON(req.body.lat, req.body.lng);
    if (!coords) return sendError(res, 400, 'Invalid coordinates');

    const location = await Loc.create({
      name: req.body.name,
      address: req.body.address,
      rating: parseInt(req.body.rating, 10) || 0,
      facilities: req.body.facilities
        ? req.body.facilities.split(',').map(f => f.trim())
        : [],
      coords,
      openingTimes: req.body.openingTimes || []
    });

    return res.status(201).json(location);
  } catch (err) {
    return sendError(res, 400, 'Error creating location', err);
  }
};

// GET /api/locations/:locationid
// app_api/controllers/locations.js
const locationsReadOne = async (req, res) => {
  try {
    const { locationid } = req.params;
    if (!mongoose.isValidObjectId(locationid)) {
      return sendError(res, 400, 'Invalid location ID');
    }

    // Populate 'reviews.author' with only the name field
    const location = await Loc.findById(locationid)
                              .populate('reviews.author', 'name');

    if (!location) return sendError(res, 404, 'Location not found');

    return res.status(200).json(location);
  } catch (err) {
    return sendError(res, 500, 'Error fetching location', err);
  }
};

// PUT /api/locations/:locationid
const locationsUpdateOne = async (req, res) => {
  try {
    const { locationid } = req.params;
    if (!mongoose.isValidObjectId(locationid)) {
      return sendError(res, 400, 'Invalid location ID');
    }

    const coords = buildGeoJSON(req.body.lat, req.body.lng);
    if (!coords) return sendError(res, 400, 'Invalid coordinates');

    const updated = await Loc.findByIdAndUpdate(
      locationid,
      {
        name: req.body.name,
        address: req.body.address,
        rating: parseInt(req.body.rating, 10) || 0,
        facilities: req.body.facilities
          ? req.body.facilities.split(',').map(f => f.trim())
          : [],
        coords,
        openingTimes: req.body.openingTimes || []
      },
      { new: true, runValidators: true }
    );

    if (!updated) return sendError(res, 404, 'Location not found');
    return res.status(200).json(updated);
  } catch (err) {
    return sendError(res, 400, 'Error updating location', err);
  }
};

// DELETE /api/locations/:locationid
const locationsDeleteOne = async (req, res) => {
  try {
    const { locationid } = req.params;
    if (!mongoose.isValidObjectId(locationid)) {
      return sendError(res, 400, 'Invalid location ID');
    }

    const deleted = await Loc.findByIdAndDelete(locationid);
    if (!deleted) return sendError(res, 404, 'Location not found');

    return res.status(204).json({ message: 'Location deleted' });
  } catch (err) {
    return sendError(res, 500, 'Error deleting location', err);
  }
};

/* ----------------- Review CRUD ----------------- */

// POST /api/locations/:locationid/reviews
const reviewsCreate = async (req, res) => {
  try {
    const { locationid } = req.params;
    const userId = req.user?._id; // comes from auth middleware
    if (!mongoose.isValidObjectId(locationid)) {
      return sendError(res, 400, 'Invalid location ID');
    }
    if (!userId) return sendError(res, 401, 'User not authenticated');

    const location = await Loc.findById(locationid);
    if (!location) return sendError(res, 404, 'Location not found');

    const review = {
      author: userId,
      rating: parseInt(req.body.rating, 10),
      reviewText: req.body.reviewText
    };

    location.reviews.push(review);
    updateAverageRating(location);
    await location.save();

    return res.status(201).json(location.reviews[location.reviews.length - 1]);
  } catch (err) {
    return sendError(res, 400, 'Error saving review', err);
  }
};

// GET /api/locations/:locationid/reviews/:reviewid
const reviewsReadOne = async (req, res) => {
  try {
    const { locationid, reviewid } = req.params;
    if (!mongoose.isValidObjectId(locationid)) {
      return sendError(res, 400, 'Invalid location ID');
    }

    const location = await Loc.findById(locationid);
    if (!location) return sendError(res, 404, 'Location not found');

    const review = location.reviews.id(reviewid);
    if (!review) return sendError(res, 404, 'Review not found');

    return res.status(200).json(review);
  } catch (err) {
    return sendError(res, 500, 'Error fetching review', err);
  }
};

// PUT /api/locations/:locationid/reviews/:reviewid
const reviewsUpdateOne = async (req, res) => {
  try {
    const { locationid, reviewid } = req.params;
    const userId = req.user?._id; // from auth
    if (!mongoose.isValidObjectId(locationid)) {
      return sendError(res, 400, 'Invalid location ID');
    }
    if (!userId) return sendError(res, 401, 'User not authenticated');

    const location = await Loc.findById(locationid);
    if (!location) return sendError(res, 404, 'Location not found');

    const review = location.reviews.id(reviewid);
    if (!review) return sendError(res, 404, 'Review not found');

    // Only allow author to update their review
    if (!review.author.equals(userId)) return sendError(res, 403, 'Not authorized to edit this review');

    review.rating = req.body.rating !== undefined ? parseInt(req.body.rating, 10) : review.rating;
    review.reviewText = req.body.reviewText || review.reviewText;

    updateAverageRating(location);
    await location.save();

    return res.status(200).json(review);
  } catch (err) {
    return sendError(res, 400, 'Error updating review', err);
  }
};

// DELETE /api/locations/:locationid/reviews/:reviewid
const reviewsDeleteOne = async (req, res) => {
  try {
    const { locationid, reviewid } = req.params;
    const userId = req.user?._id; // from auth
    if (!mongoose.isValidObjectId(locationid)) {
      return sendError(res, 400, 'Invalid location ID');
    }
    if (!userId) return sendError(res, 401, 'User not authenticated');

    const location = await Loc.findById(locationid);
    if (!location) return sendError(res, 404, 'Location not found');

    const review = location.reviews.id(reviewid);
    if (!review) return sendError(res, 404, 'Review not found');

    // Only allow author to delete their review
    if (!review.author.equals(userId)) return sendError(res, 403, 'Not authorized to delete this review');

    review.remove ? review.remove() : location.reviews.pull(review._id);

    updateAverageRating(location);
    await location.save();

    return res.status(204).json({ message: 'Review deleted' });
  } catch (err) {
    return sendError(res, 500, 'Error deleting review', err);
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.user?._id; // from auth middleware
    if (!userId) return sendError(res, 401, 'User not authenticated');

    // Find all locations that have reviews by this user
    const locations = await Loc.find({ 'reviews.author': userId })
                               .populate('reviews.author', 'name');

    // Extract only the reviews by this user
    const userReviews = [];
    locations.forEach(loc => {
      loc.reviews.forEach(r => {
        if (r.author._id.equals(userId)) {
          userReviews.push({
            reviewId: r._id,
            locationId: loc._id,
            locationName: loc.name,
            rating: r.rating,
            reviewText: r.reviewText
          });
        }
      });
    });

    return res.status(200).json(userReviews);
  } catch (err) {
    return sendError(res, 500, 'Error fetching user reviews', err);
  }
};

/* ---------- NEARBY RESTAURANTS ---------- */
const locationsNearby = async (req, res) => {
  try {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const maxDistance = parseInt(req.query.maxDistance, 10) || 5000; // default 5 km

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ message: "lng and lat are required" });
    }

    const results = await Loc.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "dist.calculated",
          spherical: true,
          maxDistance: maxDistance
        }
      },
      { $limit: 50 }
    ]);

    res.status(200).json(results);
  } catch (err) {
    console.error('Geo query error:', err);
    res.status(500).json({ message: 'Error fetching nearby locations', error: err.message });
  }
};
/* ----------------- Exports ----------------- */
module.exports = {
  // Location
  locationsList,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne,
  locationsDeleteOne,
  // Reviews
  reviewsCreate,
  reviewsReadOne,
  reviewsUpdateOne,
  reviewsDeleteOne,
  // Nearby
  locationsNearby,
  getUserReviews
};

