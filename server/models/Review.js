const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TailorProfile', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  stitchingQuality: { type: Number, min: 1, max: 5, default: 5 },
  accuracy: { type: Number, min: 1, max: 5, default: 5 },
  communication: { type: Number, min: 1, max: 5, default: 5 },
  deliveryTime: { type: Number, min: 1, max: 5, default: 5 },
  comment: { type: String, default: '' },
  verifiedOrder: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
