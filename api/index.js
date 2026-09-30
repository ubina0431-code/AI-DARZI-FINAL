// api/index.js — Vercel Serverless Entry Point
// Imports the Express app from server routes and exports it for Vercel.
// Vercel calls this file as a serverless function handler for all /api/* routes.

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../server/db');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// CORS Configuration
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim() : null;
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173',
  ...(clientUrl ? clientUrl.split(',').map(u => u.trim().replace(/\/+$/, '')) : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Darzi API is running',
    status: 'online',
    platform: 'AI Darzi Tailoring Platform',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// API Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/tailors', require('../server/routes/tailorRoutes'));
app.use('/api/measurements', require('../server/routes/measurementRoutes'));
app.use('/api/designs', require('../server/routes/designRoutes'));
app.use('/api/orders', require('../server/routes/orderRoutes'));
app.use('/api/chat', require('../server/routes/chatRoutes'));
app.use('/api/admin', require('../server/routes/adminRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
