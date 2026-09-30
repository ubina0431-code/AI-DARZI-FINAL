const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { darziChatAssistant } = require('../services/geminiService');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// POST /api/chat/assistant - Dedicated Darzi AI chatbot
router.post('/assistant', async (req, res) => {
  try {
    const { messages = [], context = {} } = req.body;
    const response = await darziChatAssistant(messages, context);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/chat/messages - Customer <-> Tailor in-app chat history
router.get('/messages', async (req, res) => {
  try {
    const { orderId, orderNumber } = req.query;

    if (isDBConnected()) {
      let filter = {};
      if (orderId) filter.orderId = orderId;
      if (orderNumber) filter.orderNumber = orderNumber;

      const messages = await Message.find(filter).sort({ createdAt: 1 });
      return res.json({ success: true, count: messages.length, data: messages });
    } else {
      let messages = [...memoryDB.messages];
      if (orderId) {
        messages = messages.filter(m => String(m.orderId) === String(orderId));
      }
      if (orderNumber) {
        messages = messages.filter(m => m.orderNumber === orderNumber);
      }
      return res.json({ success: true, count: messages.length, data: messages });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/messages - Send in-app message
router.post('/messages', async (req, res) => {
  try {
    if (isDBConnected()) {
      const newMessage = await Message.create(req.body);
      return res.status(201).json({ success: true, data: newMessage });
    } else {
      const newMessage = {
        _id: `msg_${Date.now()}`,
        ...req.body,
        createdAt: new Date()
      };
      memoryDB.messages.push(newMessage);
      return res.status(201).json({ success: true, data: newMessage });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
