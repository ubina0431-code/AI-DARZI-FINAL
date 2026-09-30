const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// Helper to generate a standardized, professional Tailor Order Sheet
function generateTailorOrderSheet(data) {
  return `TAILOR ORDER SHEET
=============================================
Order #: ${data.orderNumber}
Date: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
Customer: ${data.customerName || 'Amina Khan'} (${data.customerPhone || '+92 300 1234567'})
Delivery Address: ${data.customerAddress || 'Karachi, Pakistan'}
Selected Tailor: ${data.tailorName}
Garment Category: ${(data.garmentCategory || 'ladies').toUpperCase()}
Garment Type: ${data.garmentType}
Fabric Details: ${data.fabricName || 'Customer Unstitched Fabric'} (${data.fabricColor || 'Standard'})

KEY MEASUREMENTS (INCHES):
---------------------------------------------
- Shirt / Kameez Length: ${data.measurements?.kameezLength || 40}"
- Teera (Shoulder): ${data.measurements?.teera || 15}"
- Chaati (Chest): ${data.measurements?.chest || 38}"
- Kamar (Waist): ${data.measurements?.waist || 32}"
- Daman (Flare): ${data.measurements?.daman || 24}"
- Bazu (Sleeve Length): ${data.measurements?.sleevesLength || 21}"
- Shalwar / Trouser Length: ${data.measurements?.trouserLength || 38}"
- Paincha (Bottom Opening): ${data.measurements?.paincha || 6.5}"
- Ban / Gala (Collar): ${data.measurements?.collar || 14.5}"

DESIGN SPECIFICATIONS:
---------------------------------------------
- Neckline: ${data.designDetails?.neckline || 'Round neck with slit'}
- Sleeves: ${data.designDetails?.sleeves || 'Straight full sleeves with inner facing'}
- Shirt Cut / Length: ${data.designDetails?.length || 'Calf-length straight cut'}
- Trouser Style: ${data.designDetails?.trouser || 'Straight pants'}
- Dupatta Finishing: ${data.designDetails?.dupatta || '4-side micro-piping'}
- Special Craft / Laces: ${data.designDetails?.embroidery || 'Standard'}
- Special Instructions: ${data.designDetails?.specialInstructions || 'Ensure comfortable armhole and neat seam allowances.'}

LOGISTICS & PAYMENT:
---------------------------------------------
- Pickup: ${data.logisticsOption?.pickupType || 'Tailor Pickup'}
- Delivery: ${data.logisticsOption?.deliveryType || 'Home Delivery'}
- Payment Method: ${data.payment?.method || 'Cash on Delivery'}
- Total Amount: PKR ${data.pricing?.total || 3450}
=============================================`;
}

// GET /api/orders - List orders
router.get('/', async (req, res) => {
  try {
    const { tailorId, customerId } = req.query;

    if (isDBConnected()) {
      let filter = {};
      if (tailorId) filter.tailorId = tailorId;
      if (customerId) filter.customerId = customerId;

      const orders = await Order.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    } else {
      let orders = [...memoryDB.orders];
      if (tailorId) {
        orders = orders.filter(o => String(o.tailorId) === String(tailorId));
      }
      if (customerId) {
        orders = orders.filter(o => String(o.customerId) === String(customerId));
      }
      return res.json({ success: true, count: orders.length, data: orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders/:id - Single order details
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    if (isDBConnected()) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      return res.json({ success: true, data: order });
    } else {
      const order = memoryDB.orders.find(o => String(o._id) === String(orderId) || o.orderNumber === orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      return res.json({ success: true, data: order });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders - Create new order from wizard
router.post('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const count = await Order.countDocuments();
      const orderNumber = `AD-2026-${String(count + 893).padStart(3, '0')}`;

      const orderData = {
        ...req.body,
        orderNumber,
        status: 'New Order',
        statusHistory: [
          {
            status: 'New Order',
            timestamp: new Date(),
            note: 'Order submitted by customer via 9-step wizard.',
            updatedBy: req.body.customerName || 'Customer'
          }
        ]
      };

      orderData.tailorOrderSheet = generateTailorOrderSheet(orderData);
      const newOrder = await Order.create(orderData);
      return res.status(201).json({ success: true, data: newOrder });
    } else {
      const count = memoryDB.orders.length;
      const orderNumber = `AD-2026-${String(count + 893).padStart(3, '0')}`;

      const orderData = {
        _id: `order_${Date.now()}`,
        ...req.body,
        orderNumber,
        status: 'New Order',
        statusHistory: [
          {
            status: 'New Order',
            timestamp: new Date(),
            note: 'Order submitted by customer via 9-step wizard.',
            updatedBy: req.body.customerName || 'Customer'
          }
        ],
        createdAt: new Date()
      };

      orderData.tailorOrderSheet = generateTailorOrderSheet(orderData);
      memoryDB.orders.unshift(orderData);
      return res.status(201).json({ success: true, data: orderData });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/orders/:id/status - Update 13-stage order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, note, updatedBy = 'Tailor' } = req.body;
    const orderId = req.params.id;

    if (isDBConnected()) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated to ${status}`,
        updatedBy
      });

      await order.save();
      return res.json({ success: true, data: order });
    } else {
      const order = memoryDB.orders.find(o => String(o._id) === String(orderId) || o.orderNumber === orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      order.status = status;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated to ${status}`,
        updatedBy
      });

      return res.json({ success: true, data: order });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
