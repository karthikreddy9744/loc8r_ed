// app_api/models/locations.js
const mongoose = require('mongoose');

/* ----------------- Review Schema ----------------- */
const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: 100,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [0, 'Rating must be >= 0'],
      max: [5, 'Rating must be <= 5'],
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/* ----------------- Opening Times Schema ----------------- */
const openingTimeSchema = new mongoose.Schema(
  {
    days: { type: String, required: true }, // e.g. "Mon-Fri"
    opening: { type: String }, // e.g. "09:00am"
    closing: { type: String }, // e.g. "05:00pm"
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

/* ----------------- Location Schema ----------------- */
const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be >= 0'],
      max: [5, 'Rating must be <= 5'],
    },
    facilities: {
      type: [String],
      default: [],
    },
    coords: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function (value) {
            return value.length === 2;
          },
          message: 'Coordinates must be [lng, lat]',
        },
      },
    },
    openingTimes: {
      type: [openingTimeSchema],
      default: [],
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/* ----------------- Geo Index for location search ----------------- */
locationSchema.index({ coords: '2dsphere' });

/* ----------------- Export ----------------- */
mongoose.model('Location', locationSchema);



