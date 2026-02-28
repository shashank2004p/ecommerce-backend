/**
 * Order model: user, address, items, total, payment (online placeholder), status.
 */
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  pincode: String,
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: addressSchema,
    items: [orderItemSchema],
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'online' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  },
  { timestamps: true }
);

// User order history: list by user, newest first
orderSchema.index({ userId: 1, createdAt: -1 });
// Admin/analytics: filter by status, time range
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
// Time-series: reporting, cleanup, idempotency by date
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
