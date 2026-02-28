/**
 * Razorpay payment: create order, verify signature, update order.
 */
import crypto from 'crypto';
import Razorpay from 'razorpay';
import config from '../config/index.js';
import Order from '../models/Order.model.js';

function getRazorpayInstance() {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    const err = new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    err.statusCode = 503;
    throw err;
  }
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

/**
 * Create a Razorpay order for the given DB order. Amount in paise (INR).
 * Updates order with razorpayOrderId.
 */
export async function createRazorpayOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  if (order.paymentStatus === 'paid') {
    const err = new Error('Order is already paid');
    err.statusCode = 400;
    throw err;
  }
  const amountPaise = Math.round(Number(order.total) * 100);
  if (amountPaise < 100) {
    const err = new Error('Order amount too low for payment');
    err.statusCode = 400;
    throw err;
  }
  const instance = getRazorpayInstance();
  const razorpayOrder = await instance.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: orderId.toString(),
    notes: { orderId: orderId.toString() },
  });
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();
  return {
    razorpayOrderId: razorpayOrder.id,
    keyId: config.razorpay.keyId,
    amount: amountPaise,
    currency: 'INR',
    orderId: order._id.toString(),
  };
}

/**
 * Verify Razorpay signature and mark order as paid.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export function verifySignature(razorpayOrderId, razorpayPaymentId, signature) {
  const secret = config.razorpay.keySecret;
  if (!secret) {
    const err = new Error('Razorpay is not configured');
    err.statusCode = 503;
    throw err;
  }
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export async function verifyAndCapturePayment(orderId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const err = new Error('Missing payment verification fields');
    err.statusCode = 400;
    throw err;
  }
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  if (order.razorpayOrderId !== razorpay_order_id) {
    const err = new Error('Razorpay order does not match');
    err.statusCode = 400;
    throw err;
  }
  if (order.paymentStatus === 'paid') {
    return { verified: true, alreadyPaid: true };
  }
  const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    const err = new Error('Payment verification failed');
    err.statusCode = 400;
    throw err;
  }
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();
  return { verified: true };
}
