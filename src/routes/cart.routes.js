/**
 * Cart routes (all protected):
 * GET    /api/cart – get user cart
 * POST   /api/cart/add – body: { productId, quantity? }
 * PATCH  /api/cart – body: { productId, quantity }
 * POST   /api/cart/remove – body: { productId }
 */
import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/', cartController.updateQuantity);
router.post('/remove', cartController.removeFromCart);

export default router;
