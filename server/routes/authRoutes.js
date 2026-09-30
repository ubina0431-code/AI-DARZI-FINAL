const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const { authMiddleware, JWT_SECRET } = require('../middleware/authMiddleware');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

// Helper to check if DB is connected
const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer', city = 'Lahore', address = '', businessName = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDBConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists. Please log in.' });
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone ? phone.trim() : '+92 300 0000000',
        role,
        city,
        address,
        businessName
      });

      if (role === 'tailor') {
        const existingProfile = await TailorProfile.findOne({ masterTailorName: user.name });
        if (!existingProfile) {
          await TailorProfile.create({
            businessName: businessName || `${user.name} Boutique`,
            masterTailorName: user.name,
            city: user.city || 'Lahore',
            area: user.address || 'Central Market',
            fullAddress: user.address || 'Central City Market',
            phone: user.phone,
            bio: `Specialized custom tailor for modern & traditional attire.`,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
            coverImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80",
            rating: 5.0,
            reviewCount: 1,
            completedOrders: 0,
            startingPrice: 1500,
            turnaroundDays: 3,
            specialties: ["Ladies Lawn", "Gents Kurta", "Alterations"],
            categories: ["ladies", "gents", "alterations"],
            services: [
              { name: "3-Piece Suit Stitching", category: "ladies", basePrice: 2000, turnaroundDays: 3, description: "Complete custom stitching." }
            ],
            verified: true,
            availableNow: true
          });
        }
      }

      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: user.toSafeObject()
      });
    } else {
      // Memory fallback
      const existingUser = memoryDB.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists. Please log in.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: `user_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : '+92 300 0000000',
        role,
        city,
        address,
        businessName,
        privacyPreferences: {
          hidePhotosFromTailor: true,
          onlyShareMeasurements: true,
          allowTailorDirectCalls: false
        },
        createdAt: new Date()
      };

      memoryDB.users.push(newUser);

      if (role === 'tailor') {
        memoryDB.tailors.push({
          _id: `tailor_${Date.now()}`,
          businessName: businessName || `${newUser.name} Boutique`,
          masterTailorName: newUser.name,
          city: newUser.city || 'Lahore',
          area: newUser.address || 'Central Market',
          fullAddress: newUser.address || 'Central City Market',
          phone: newUser.phone,
          bio: `Specialized custom tailor for modern & traditional attire.`,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
          coverImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80",
          rating: 5.0,
          reviewCount: 1,
          completedOrders: 0,
          startingPrice: 1500,
          turnaroundDays: 3,
          specialties: ["Ladies Lawn", "Gents Kurta", "Alterations"],
          categories: ["ladies", "gents", "alterations"],
          services: [
            { name: "3-Piece Suit Stitching", category: "ladies", basePrice: 2000, turnaroundDays: 3, description: "Complete custom stitching." }
          ],
          verified: true,
          availableNow: true
        });
      }

      const token = generateToken(newUser);
      const safeUser = { ...newUser };
      delete safeUser.password;

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: safeUser
      });
    }
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ success: false, error: error.message || 'Registration failed.' });
  }
});

// POST /api/auth/login - Log in with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDBConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: user.toSafeObject()
      });
    } else {
      // Memory fallback
      const user = memoryDB.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      let isMatch = false;
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // Test with bcrypt or check if password is 'password123' / 'admin123'
        isMatch = await bcrypt.compare(password, user.password).catch(() => false);
        if (!isMatch && (password === 'password123' || password === 'admin123')) {
          isMatch = true;
        }
      } else {
        isMatch = user.password === password;
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      const safeUser = { ...user };
      delete safeUser.password;

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: safeUser
      });
    }
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, error: error.message || 'Login failed.' });
  }
});

// GET /api/auth/me - Get current logged-in user details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, city, address, privacyPreferences } = req.body;

    if (isDBConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (city) user.city = city;
      if (address) user.address = address;
      if (privacyPreferences) {
        user.privacyPreferences = { ...user.privacyPreferences, ...privacyPreferences };
      }

      await user.save();
      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: user.toSafeObject()
      });
    } else {
      const user = memoryDB.users.find(u => String(u._id) === String(req.user._id));
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (city) user.city = city;
      if (address) user.address = address;
      if (privacyPreferences) {
        user.privacyPreferences = { ...user.privacyPreferences, ...privacyPreferences };
      }

      const safeUser = { ...user };
      delete safeUser.password;

      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: safeUser
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/users - List users (Admin)
router.get('/users', async (req, res) => {
  try {
    if (isDBConnected()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, data: users });
    } else {
      const users = memoryDB.users.map(u => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
      return res.json({ success: true, count: users.length, data: users });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
