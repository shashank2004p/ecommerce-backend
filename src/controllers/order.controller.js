/**
 * Order controller: create order, create/verify Razorpay payment, list orders, get order.
 */
import * as orderService from '../services/order.service.js';
import * as paymentService from '../services/payment.service.js';
import { success } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const data = await orderService.createOrder(userId, { ...req.body, paymentMethod: 'online' });
  return success(res, data, 'Order created', 201);
});

export const createPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.createRazorpayOrder(req.params.id);
  return success(res, data, 'Payment order created');
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.verifyAndCapturePayment(req.params.id, req.body);
  return success(res, data, 'Payment verified');
});

export const listOrders = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Authentication required to view orders', data: null });
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await orderService.getOrdersByUser(req.user.id, { page, limit });
  return success(res, data, 'Orders retrieved');
});

export const getOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const data = await orderService.getOrderById(req.params.id, userId);
  return success(res, data, 'Order retrieved');
});
