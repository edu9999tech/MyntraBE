const mongoose = require('mongoose');

const orderLineSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', // Reference to Item collection
    required: true
  },
  name: { type: String, required: true }, // Product name snapshot
  price: { type: Number, required: true }, // Unit price at the time of order
  quantity: { type: Number, required: true, default: 1 },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  cancelledAt: { type: Date }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'fulfilled', 'cancelled'],
      default: 'open'
    },
    lines: [orderLineSchema],
    totalAmount: { type: Number, default: 0 },
    paymentInfo: {
      method: { type: String }, // e.g., "card", "upi", "cash"
      transactionId: { type: String },
      paidAt: { type: Date }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order
