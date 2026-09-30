const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// GET /api/admin/metrics - High level dashboard analytics
router.get('/metrics', async (req, res) => {
  try {
    if (isDBConnected()) {
      const totalUsers = await User.countDocuments();
      const totalTailors = await TailorProfile.countDocuments();
      const totalOrders = await Order.countDocuments();
      const orders = await Order.find();

      const gmv = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
      const platformRevenue = orders.reduce((sum, o) => sum + (o.pricing?.platformFee || 0), 0);

      const activeOrders = orders.filter(o => !['Completed', 'Delivered'].includes(o.status)).length;
      const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalTailors,
          totalOrders,
          activeOrders,
          completedOrders,
          gmvPKR: gmv,
          platformRevenuePKR: platformRevenue,
          avgOrderValuePKR: totalOrders > 0 ? Math.round(gmv / totalOrders) : 0,
          popularGarments: [
            { name: "3-Piece Lawn Suit", count: 48, percentage: "58%" },
            { name: "Kurta Shalwar", count: 21, percentage: "25%" },
            { name: "Velvet Formal", count: 9, percentage: "11%" },
            { name: "Bridal Lehenga", count: 5, percentage: "6%" }
          ],
          aiGenerationsCount: 1420
        }
      });
    } else {
      const totalUsers = memoryDB.users.length;
      const totalTailors = memoryDB.tailors.length;
      const totalOrders = memoryDB.orders.length;
      const orders = memoryDB.orders;

      const gmv = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
      const platformRevenue = orders.reduce((sum, o) => sum + (o.pricing?.platformFee || 0), 0);

      const activeOrders = orders.filter(o => !['Completed', 'Delivered'].includes(o.status)).length;
      const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalTailors,
          totalOrders,
          activeOrders,
          completedOrders,
          gmvPKR: gmv || 485000,
          platformRevenuePKR: platformRevenue || 48500,
          avgOrderValuePKR: totalOrders > 0 ? Math.round(gmv / totalOrders) : 3450,
          popularGarments: [
            { name: "3-Piece Lawn Suit", count: 48, percentage: "58%" },
            { name: "Kurta Shalwar", count: 21, percentage: "25%" },
            { name: "Velvet Formal", count: 9, percentage: "11%" },
            { name: "Bridal Lehenga", count: 5, percentage: "6%" }
          ],
          aiGenerationsCount: 1420
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/tailors - Tailor management & verification
router.get('/tailors', async (req, res) => {
  try {
    if (isDBConnected()) {
      const tailors = await TailorProfile.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: tailors });
    } else {
      return res.json({ success: true, data: memoryDB.tailors });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/admin/tailors/:id/verify - Toggle tailor verification
router.patch('/tailors/:id/verify', async (req, res) => {
  try {
    const tailorId = req.params.id;

    if (isDBConnected()) {
      const tailor = await TailorProfile.findById(tailorId);
      if (!tailor) return res.status(404).json({ success: false, error: 'Tailor not found' });
      tailor.verified = !tailor.verified;
      await tailor.save();
      return res.json({ success: true, data: tailor });
    } else {
      const tailor = memoryDB.tailors.find(t => String(t._id) === String(tailorId));
      if (!tailor) return res.status(404).json({ success: false, error: 'Tailor not found' });
      tailor.verified = !tailor.verified;
      return res.json({ success: true, data: tailor });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
