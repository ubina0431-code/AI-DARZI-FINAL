const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: { type: String, default: '' },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['customer', 'tailor', 'ai_assistant', 'admin'], required: true },
  recipientId: { type: String, required: true },
  text: { type: String, required: true },
  attachments: [{
    type: { type: String, enum: ['image', 'measurement_sheet', 'audio', 'design_spec'] },
    url: { type: String },
    title: { type: String }
  }],
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
