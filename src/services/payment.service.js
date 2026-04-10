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
function assertOrderAccess(order, userId) {
  // If the order is tied to a user, only that user can pay/verify it.
  if (order.userId && userId && order.userId.toString() !== userId) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  if (order.userId && !userId) {
    const err = new Error('Authentication required for this order');
    err.statusCode = 401;
    throw err;
  }
}

export async function createRazorpayOrder(orderId, userId = null) {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  assertOrderAccess(order, userId);
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

export async function verifyAndCapturePayment(orderId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }, userId = null) {
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
  assertOrderAccess(order, userId);
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

  // Confirm server-side with Razorpay API as a second check:
  // - payment belongs to our order
  // - amount matches
  // - status is captured (or capture if authorized)
  const instance = getRazorpayInstance();
  const payment = await instance.payments.fetch(razorpay_payment_id);
  const expectedAmount = Math.round(Number(order.total) * 100);

  if (payment?.order_id !== razorpay_order_id) {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    const err = new Error('Payment does not belong to this order');
    err.statusCode = 400;
    throw err;
  }
  if (Number(payment?.amount) !== expectedAmount) {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    const err = new Error('Paid amount does not match order total');
    err.statusCode = 400;
    throw err;
  }

  let finalPayment = payment;
  if (payment?.status === 'authorized') {
    finalPayment = await instance.payments.capture(razorpay_payment_id, expectedAmount, 'INR');
  }

  if (finalPayment?.status !== 'captured') {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed', razorpayPaymentId: razorpay_payment_id });
    const err = new Error('Payment not captured');
    err.statusCode = 400;
    throw err;
  }

  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();
  return { verified: true, captured: true };
}

function verifyWebhookSignature(rawBody, signature) {
  const secret = config.razorpay.webhookSecret;
  if (!secret) {
    const err = new Error('Razorpay webhook is not configured. Set RAZORPAY_WEBHOOK_SECRET.');
    err.statusCode = 503;
    throw err;
  }
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * Razorpay webhook handler.
 * - Verifies x-razorpay-signature against raw request body.
 * - Updates matching Order by receipt (our DB orderId) where possible.
 */
export async function handleRazorpayWebhook({ rawBody, signature, payload }) {
  const ok = verifyWebhookSignature(rawBody, signature);
  if (!ok) {
    const err = new Error('Invalid webhook signature');
    err.statusCode = 400;
    throw err;
  }

  // We mainly rely on order entity receipt/notes to map back to our DB orderId.
  const event = payload?.event;
  const orderEntity = payload?.payload?.order?.entity;
  const paymentEntity = payload?.payload?.payment?.entity;

  const receipt = orderEntity?.receipt || orderEntity?.notes?.orderId || paymentEntity?.notes?.orderId;
  const orderId = receipt || null;

  if (!orderId) {
    return { received: true, ignored: true, reason: 'No receipt/orderId in webhook payload' };
  }

  const update = {};
  const paymentId = paymentEntity?.id;

  if (event === 'payment.captured' || event === 'order.paid') {
    update.paymentStatus = 'paid';
    if (paymentId) update.razorpayPaymentId = paymentId;
    if (orderEntity?.id) update.razorpayOrderId = orderEntity.id;
  } else if (event === 'payment.failed') {
    update.paymentStatus = 'failed';
    if (paymentId) update.razorpayPaymentId = paymentId;
    if (orderEntity?.id) update.razorpayOrderId = orderEntity.id;
  } else {
    return { received: true, ignored: true, reason: `Unhandled event: ${event}` };
  }

  await Order.findByIdAndUpdate(orderId, update, { new: false });
  return { received: true, updated: true, event };
}
