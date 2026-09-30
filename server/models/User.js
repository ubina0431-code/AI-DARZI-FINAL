const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'tailor', 'admin', 'both'], default: 'customer' },
  city: { type: String, default: 'Lahore' },
  address: { type: String, default: '' },
  businessName: { type: String, default: '' }, // For tailor users
  privacyPreferences: {
    hidePhotosFromTailor: { type: Boolean, default: true },
    onlyShareMeasurements: { type: Boolean, default: true },
    allowTailorDirectCalls: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to return user info without password
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
