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

// POST new review for a location
router.post('/locations/:locationid/reviews', ctrlLocations.reviewsCreate);

// GET a single review
router.get('/locations/:locationid/reviews/:reviewid', ctrlLocations.reviewsReadOne);

// PUT update review
router.put('/locations/:locationid/reviews/:reviewid', ctrlLocations.reviewsUpdateOne);

// DELETE review
router.delete('/locations/:locationid/reviews/:reviewid', ctrlLocations.reviewsDeleteOne);



module.exports = router;
