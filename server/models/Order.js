const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerCity: { type: String, default: 'Lahore' },
  customerAddress: { type: String, default: '' },
  
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TailorProfile', required: true },
  tailorName: { type: String, required: true },
  
  garmentCategory: { type: String, enum: ['ladies', 'gents', 'kids'], default: 'ladies' },
  garmentType: { type: String, required: true },
  designTitle: { type: String, default: 'Custom Tailored Suit' },
  designDetails: {
    neckline: { type: String, default: 'Round with slit' },
    sleeves: { type: String, default: 'Full straight' },
    length: { type: String, default: 'Calf-length' },
    trouser: { type: String, default: 'Straight pants' },
    dupatta: { type: String, default: 'Chiffon border' },
    embroidery: { type: String, default: 'Minimal lace and neck piping' },
    specialInstructions: { type: String, default: '' },
    referenceImageUrl: { type: String, default: '' }
  },

  measurements: {
    profileName: { type: String, default: 'My Measurements' },
    kameezLength: { type: Number, default: 40 },
    teera: { type: Number, default: 15 },
    chest: { type: Number, default: 38 },
    waist: { type: Number, default: 32 },
    daman: { type: Number, default: 24 },
    sleevesLength: { type: Number, default: 21 },
    trouserLength: { type: Number, default: 38 },
    paincha: { type: Number, default: 6.5 },
    collar: { type: Number, default: 14.5 }
  },

  fabricOption: { type: String, enum: ['customer_pickup', 'tailor_provides', 'already_sent'], default: 'customer_pickup' },
  fabricName: { type: String, default: 'Customer Lawn Unstitched' },
  fabricColor: { type: String, default: 'Emerald Green' },

  logisticsOption: {
    pickupType: { type: String, enum: ['tailor_pickup', 'customer_dropoff', 'courier'], default: 'tailor_pickup' },
    deliveryType: { type: String, enum: ['home_delivery', 'self_pickup', 'courier'], default: 'home_delivery' }
  },

  pricing: {
    tailoring: { type: Number, default: 2500 },
    fabric: { type: Number, default: 0 },
    embroidery: { type: Number, default: 600 },
    pickup: { type: Number, default: 150 },
    delivery: { type: Number, default: 200 },
    platformFee: { type: Number, default: 100 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 3550 }
  },

  payment: {
    method: { type: String, enum: ['cash_on_delivery', 'jazzcash_easypaisa', 'online_card', 'deposit_50_50'], default: 'cash_on_delivery' },
    status: { type: String, enum: ['pending', 'deposit_paid', 'paid', 'refunded'], default: 'pending' }
  },

  deadlineDate: { type: Date },
  
  status: {
    type: String,
    enum: [
      'New Order',
      'Reviewing',
      'Quotation Sent',
      'Accepted',
      'Fabric Received',
      'Cutting',
      'Stitching',
      'Quality Check',
      'Ready',
      'Picked Up',
      'Out for Delivery',
      'Delivered',
      'Completed'
    ],
    default: 'New Order'
  },

  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' }
  }],

  tailorOrderSheet: {
    type: String,
    default: ''
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
