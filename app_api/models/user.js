// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },

  // Profile Info
  name: { type: String, trim: true },
  email: { type: String, trim: true, unique: true, sparse: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  bio: { type: String, maxlength: 400 },
  avatar: { data: Buffer,       // stores the image binary
    contentType: String  },

  // Relation: store all review ObjectIds written by this user
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);