const express = require('express');
const router = express.Router();
const Design = require('../models/Design');
const { generateFashionDesign, analyzeClothingImage } = require('../services/geminiService');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// POST /api/designs/generate - Text-to-fashion AI design generator
router.post('/generate', async (req, res) => {
  try {
    const result = await generateFashionDesign(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/designs/analyze-image - Multimodal Computer Vision design breakdown
router.post('/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'imageBase64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const analysis = await analyzeClothingImage(cleanBase64, mimeType);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/designs - Get saved designs
router.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const designs = await Design.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: designs });
    } else {
      return res.json({ success: true, data: memoryDB.designs });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/designs/save - Save custom or generated design
router.post('/save', async (req, res) => {
  try {
    if (isDBConnected()) {
      const newDesign = await Design.create(req.body);
      return res.json({ success: true, data: newDesign });
    } else {
      const newDesign = {
        _id: `design_${Date.now()}`,
        ...req.body,
        createdAt: new Date()
      };
      memoryDB.designs.unshift(newDesign);
      return res.json({ success: true, data: newDesign });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
