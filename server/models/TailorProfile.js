const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['ladies', 'gents', 'kids', 'bridal', 'formal', 'casual', 'alterations', 'uniforms', 'traditional', 'western', 'embroidery'], required: true },
  basePrice: { type: Number, required: true },
  description: { type: String, default: '' },
  turnaroundDays: { type: Number, default: 4 }
});

const tailorProfileSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  masterTailorName: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  fullAddress: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  startingPrice: { type: Number, default: 1500 },
  turnaroundDays: { type: Number, default: 3 },
  specialties: [{ type: String }],
  categories: [{ type: String, enum: ['ladies', 'gents', 'kids', 'bridal', 'formal', 'casual', 'alterations', 'traditional', 'western', 'embroidery'] }],
  services: [serviceItemSchema],
  portfolio: [{
    title: { type: String },
    garmentType: { type: String },
    image: { type: String },
    description: { type: String }
  }],
  pickupAvailable: { type: Boolean, default: true },
  deliveryAvailable: { type: Boolean, default: true },
  pickupDeliveryFee: { type: Number, default: 350 },
  serviceRadiusKm: { type: Number, default: 15 },
  verified: { type: Boolean, default: true },
  availableNow: { type: Boolean, default: true },
  workingHours: { type: String, default: '10:00 AM - 9:00 PM (Mon - Sat)' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.TailorProfile || mongoose.model('TailorProfile', tailorProfileSchema);
