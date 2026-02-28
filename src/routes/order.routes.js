/**
 * Order routes:
 * POST /api/orders – create order (optional auth)
 * POST /api/orders/:id/create-payment – create Razorpay order
 * POST /api/orders/:id/verify-payment – verify Razorpay payment
 * GET  /api/orders – list orders (protected)
 * GET  /api/orders/:id – get order (protected for own order)
 */
import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { optionalAuth, authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', optionalAuth, orderController.createOrder);
router.get('/', authenticate, orderController.listOrders);
router.post('/:id/create-payment', orderController.createPayment);
router.post('/:id/verify-payment', orderController.verifyPayment);
router.get('/:id', authenticate, orderController.getOrder);

export default router;
