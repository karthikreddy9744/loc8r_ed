// app_api/routes/index.js
const express = require('express');
const router = express.Router();

// Controllers
const ctrlLocations = require('../controllers/locations');
const auth = require('../middleware/auth');

/* ----------------- Location Routes ----------------- */
// GET locations nearby
router.get('/locations/nearby', ctrlLocations.locationsNearby);
// GET all locations
router.get('/locations', ctrlLocations.locationsList);


// GET one location
router.get('/locations/:locationid', ctrlLocations.locationsReadOne);

/* ----------------- Admin Routes ----------------- */

// Create location (admin only)
router.post('/locations', auth.verifyUser, auth.requireAdmin, ctrlLocations.locationsCreate);

// Edit location (admin only)
router.put('/locations/:locationid', auth.verifyUser, auth.requireAdmin, ctrlLocations.locationsUpdateOne);

// Delete location (admin only)
router.delete('/locations/:locationid', auth.verifyUser, auth.requireAdmin,  ctrlLocations.locationsDeleteOne);

/* ----------------- Review Routes ----------------- */

// POST a review - only authenticated users
router.post(
  '/locations/:locationid/reviews',
  auth.requireAuth,               // <--- add this
  ctrlLocations.reviewsCreate
);

// GET a single review - public
router.get(
  '/locations/:locationid/reviews/:reviewid',
  ctrlLocations.reviewsReadOne
);

// PUT update review - only author (must be authenticated)
router.put(
  '/locations/:locationid/reviews/:reviewid',
  auth.requireAuth,               // <--- add this
  ctrlLocations.reviewsUpdateOne
);

// DELETE review - only author (must be authenticated)
router.delete(
  '/locations/:locationid/reviews/:reviewid',
  auth.requireAuth,               // <--- add this
  ctrlLocations.reviewsDeleteOne
);

// GET all reviews of the logged-in user
router.get('/profile/reviews', auth.requireAuth, ctrlLocations.getUserReviews);


module.exports = router;
