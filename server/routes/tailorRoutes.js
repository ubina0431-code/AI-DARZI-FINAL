const express = require('express');
const router = express.Router();
const TailorProfile = require('../models/TailorProfile');
const Review = require('../models/Review');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// GET /api/tailors - Search & filter marketplace
router.get('/', async (req, res) => {
  try {
    const { city, category, search, pickupOnly, sort } = req.query;

    if (isDBConnected()) {
      let filter = {};

      if (city && city !== 'All') {
        filter.city = new RegExp(city, 'i');
      }

      if (category && category !== 'All') {
        filter.categories = category.toLowerCase();
      }

      if (pickupOnly === 'true') {
        filter.pickupAvailable = true;
      }

      if (search) {
        filter.$or = [
          { businessName: new RegExp(search, 'i') },
          { masterTailorName: new RegExp(search, 'i') },
          { area: new RegExp(search, 'i') },
          { specialties: new RegExp(search, 'i') }
        ];
      }

      let query = TailorProfile.find(filter);

      if (sort === 'rating') {
        query = query.sort({ rating: -1 });
      } else if (sort === 'price_asc') {
        query = query.sort({ startingPrice: 1 });
      } else if (sort === 'orders') {
        query = query.sort({ completedOrders: -1 });
      } else {
        query = query.sort({ rating: -1, completedOrders: -1 });
      }

      const tailors = await query.exec();
      return res.json({ success: true, count: tailors.length, data: tailors });
    } else {
      // In-memory filter
      let tailors = [...memoryDB.tailors];

      if (city && city !== 'All') {
        tailors = tailors.filter(t => t.city.toLowerCase() === city.toLowerCase());
      }

      if (category && category !== 'All') {
        tailors = tailors.filter(t => t.categories && t.categories.includes(category.toLowerCase()));
      }

      if (pickupOnly === 'true') {
        tailors = tailors.filter(t => t.pickupAvailable === true);
      }

      if (search) {
        const s = search.toLowerCase();
        tailors = tailors.filter(t => 
          (t.businessName && t.businessName.toLowerCase().includes(s)) ||
          (t.masterTailorName && t.masterTailorName.toLowerCase().includes(s)) ||
          (t.area && t.area.toLowerCase().includes(s)) ||
          (t.specialties && t.specialties.some(sp => sp.toLowerCase().includes(s)))
        );
      }

      if (sort === 'rating') {
        tailors.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'price_asc') {
        tailors.sort((a, b) => a.startingPrice - b.startingPrice);
      } else if (sort === 'orders') {
        tailors.sort((a, b) => b.completedOrders - a.completedOrders);
      } else {
        tailors.sort((a, b) => b.rating - a.rating);
      }

      return res.json({ success: true, count: tailors.length, data: tailors });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tailors/:id - Storefront & Reviews
router.get('/:id', async (req, res) => {
  try {
    const tailorId = req.params.id;

    if (isDBConnected()) {
      const tailor = await TailorProfile.findById(tailorId);
      if (!tailor) {
        return res.status(404).json({ success: false, error: 'Tailor profile not found' });
      }

      const reviews = await Review.find({ tailorId: tailor._id }).sort({ createdAt: -1 });
      return res.json({ success: true, data: { ...tailor.toObject(), reviews } });
    } else {
      const tailor = memoryDB.tailors.find(t => String(t._id) === String(tailorId));
      if (!tailor) {
        return res.status(404).json({ success: false, error: 'Tailor profile not found' });
      }

      const reviews = memoryDB.reviews.filter(r => String(r.tailorId) === String(tailorId));
      return res.json({ success: true, data: { ...tailor, reviews } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
