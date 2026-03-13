/**
 * Razorpay webhook controller (raw body).
 */
import * as paymentService from '../services/payment.service.js';
import { success } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer (because this route uses express.raw)
  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    const err = new Error('Invalid JSON payload');
    err.statusCode = 400;
    throw err;
  }

  const data = await paymentService.handleRazorpayWebhook({ rawBody, signature, payload });
  return success(res, data, 'Webhook received');
});

