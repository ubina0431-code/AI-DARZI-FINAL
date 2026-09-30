const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

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
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching origins
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || allowedOrigins.includes(origin?.replace(/\/+$/, ''))) {
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

// Static files
app.use(express.static(path.join(__dirname, '../public')));

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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tailors', require('./routes/tailorRoutes'));
app.use('/api/measurements', require('./routes/measurementRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Single Page Application fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ AI DARZI PLATFORM BACKEND ACTIVE`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`💎 Integrated with MongoDB Atlas & Google Gemini API`);
  console.log(`🔐 Authentication & JWT Security Active`);
  console.log(`======================================================\n`);
});

module.exports = app;
