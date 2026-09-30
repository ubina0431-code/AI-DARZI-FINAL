const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return true;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'your_mongodb_connection_string') {
    console.warn('\n⚠️ [MongoDB] Warning: MONGODB_URI is not configured in .env.');
    console.warn('⚠️ [MongoDB] Please update MONGODB_URI in .env with your MongoDB Atlas connection string.\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: true,
    });
    isConnected = true;
    console.log(`\n✅ [MongoDB] Successfully connected to MongoDB Atlas: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`\n❌ [MongoDB] Atlas Connection Error: ${error.message}`);
    if (error.message.includes('auth') || error.message.includes('Authentication failed')) {
      console.error('💡 [MongoDB Troubleshooting] Please check the database username and password in MONGODB_URI in your .env file.');
    } else if (error.message.includes('queryTxt ETIMEOUT') || error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      console.error('💡 [MongoDB Troubleshooting] Network timeout. Check your internet connection and MongoDB Atlas IP Whitelist (Network Access -> Allow from Anywhere 0.0.0.0/0).');
    }
    console.log('⚡ [MongoDB] Platform in-memory fallback service activated for smooth demonstration.\n');
    return false;
  }
};

module.exports = { connectDB, mongoose, isConnected: () => isConnected };
