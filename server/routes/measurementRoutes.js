const express = require('express');
const router = express.Router();
const MeasurementWallet = require('../models/MeasurementWallet');
const { estimateMeasurementsFromCV } = require('../services/geminiService');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// GET /api/measurements - Retrieve all saved profiles in wallet
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'guest';

    if (isDBConnected()) {
      let profiles = await MeasurementWallet.find({
        $or: [{ userId: userId }, { userId: { $exists: true } }]
      }).sort({ lastUpdated: -1 });

      return res.json({ success: true, count: profiles.length, data: profiles });
    } else {
      let profiles = memoryDB.measurements;
      if (userId && userId !== 'guest') {
        const userSpecific = profiles.filter(p => p.userId === userId);
        if (userSpecific.length > 0) profiles = userSpecific;
      }
      return res.json({ success: true, count: profiles.length, data: profiles });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/measurements - Save or update measurement profile
router.post('/', async (req, res) => {
  try {
    const { userId = 'guest', profileName = 'My Measurements', gender = 'female', garmentType = 'Shalwar Kameez', measurements = {}, source = 'manual', notes = '' } = req.body;

    if (isDBConnected()) {
      let profile = await MeasurementWallet.findOne({ userId, profileName });

      if (profile) {
        profile.gender = gender || profile.gender;
        profile.garmentType = garmentType || profile.garmentType;
        profile.measurements = { ...profile.measurements, ...measurements };
        profile.source = source || profile.source;
        profile.notes = notes || profile.notes;
        profile.lastUpdated = new Date();
        await profile.save();
      } else {
        profile = await MeasurementWallet.create({
          userId,
          profileName,
          gender,
          garmentType,
          measurements,
          source,
          notes,
          lastUpdated: new Date()
        });
      }

      return res.json({ success: true, data: profile });
    } else {
      let profileIndex = memoryDB.measurements.findIndex(p => p.userId === userId && p.profileName === profileName);

      if (profileIndex >= 0) {
        memoryDB.measurements[profileIndex] = {
          ...memoryDB.measurements[profileIndex],
          gender,
          garmentType,
          measurements: { ...memoryDB.measurements[profileIndex].measurements, ...measurements },
          source,
          notes,
          lastUpdated: new Date()
        };
        return res.json({ success: true, data: memoryDB.measurements[profileIndex] });
      } else {
        const newProfile = {
          _id: `meas_${Date.now()}`,
          userId,
          profileName,
          gender,
          garmentType,
          measurements,
          source,
          notes,
          confidenceScore: 95,
          lastUpdated: new Date()
        };
        memoryDB.measurements.unshift(newProfile);
        return res.json({ success: true, data: newProfile });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/measurements/estimate-cv - Camera/Garment CV landmark estimation
router.post('/estimate-cv', (req, res) => {
  try {
    const { landmarks, heightInches = 64, gender = 'female' } = req.body;
    const estimates = estimateMeasurementsFromCV(landmarks, Number(heightInches), gender);
    res.json({ success: true, data: estimates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
