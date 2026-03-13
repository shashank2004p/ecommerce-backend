/**
 * Payment routes (Razorpay webhook uses raw body).
 */
import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// Note: this route must be mounted with express.raw({ type: 'application/json' })
router.post('/razorpay/webhook', paymentController.razorpayWebhook);

export default router;

