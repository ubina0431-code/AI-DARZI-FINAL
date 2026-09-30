const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  title: { type: String, required: true },
  prompt: { type: String, default: '' },
  gender: { type: String, enum: ['ladies', 'gents', 'kids'], default: 'ladies' },
  garmentType: { type: String, default: '3-Piece Lawn Suit' },
  fabric: { type: String, default: 'Premium Lawn' },
  colorPalette: [{ type: String }],
  pattern: { type: String, default: 'Floral & Geometric' },
  neckline: { type: String, default: 'Boat Neck with Slit' },
  sleevesStyle: { type: String, default: 'Straight with Embroidered Cuffs' },
  trouserStyle: { type: String, default: 'Straight Trousers with Pintucks' },
  dupattaStyle: { type: String, default: 'Chiffon with Four-Side Lace Border' },
  embroideryDetails: { type: String, default: 'Resham threadwork on neckline and sleeves' },
  buttonsLaces: { type: String, default: 'Small fabric covered potli buttons' },
  lengthStyle: { type: String, default: 'Calf-length (42 inches)' },
  occasion: { type: String, default: 'Eid / Festive Casual' },
  estimatedBudget: { type: String, default: 'PKR 3,500 - 5,000' },
  referenceImage: { type: String, default: '' },
  tailorInstructions: { type: String, default: '' },
  variations: [{
    label: { type: String },
    description: { type: String },
    modifiedAttributes: { type: Object }
  }],
  aiGenerated: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Design || mongoose.model('Design', designSchema);
