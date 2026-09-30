const mongoose = require('mongoose');

const measurementWalletSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  profileName: { type: String, required: true }, // e.g. "My Measurements", "Ammi", "Abba", "Sister"
  gender: { type: String, enum: ['female', 'male', 'kid'], default: 'female' },
  garmentType: { type: String, default: 'Shalwar Kameez' },
  measurements: {
    // Top / Kameez / Kurta
    kameezLength: { type: Number, default: 40 },      // Inches
    teera: { type: Number, default: 15 },             // Shoulder
    chest: { type: Number, default: 38 },             // Chaati
    waist: { type: Number, default: 32 },             // Kamar
    hip: { type: Number, default: 42 },               // Hip
    daman: { type: Number, default: 24 },             // Hemline width
    sleevesLength: { type: Number, default: 21 },     // Bazu lambai
    sleeveOpening: { type: Number, default: 6 },      // Mori
    armhole: { type: Number, default: 8.5 },          // Mudha
    bicep: { type: Number, default: 13 },
    collar: { type: Number, default: 14.5 },          // Gala / Ban
    frontNeckDepth: { type: Number, default: 7 },
    backNeckDepth: { type: Number, default: 4 },

    // Bottom / Shalwar / Trouser / Pants
    trouserLength: { type: Number, default: 38 },     // Shalwar lambai
    paincha: { type: Number, default: 6.5 },          // Bottom opening
    waistLower: { type: Number, default: 34 },
    hipLower: { type: Number, default: 44 },
    thigh: { type: Number, default: 26 },             // Raan
    inseam: { type: Number, default: 28 },
    aasan: { type: Number, default: 15 },             // Crotch depth
    shalwarGhera: { type: Number, default: 20 }       // Shalwar flare width
  },
  source: { type: String, enum: ['manual', 'ai_camera', 'garment_photo'], default: 'manual' },
  confidenceScore: { type: Number, default: 98 },
  notes: { type: String, default: 'Standard tailored fit with comfortable ease.' },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.MeasurementWallet || mongoose.model('MeasurementWallet', measurementWalletSchema);
