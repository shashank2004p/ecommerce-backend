/**
 * Cart controller: get, add, update quantity, remove.
 */
import * as cartService from '../services/cart.service.js';
import { success } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  const data = await cartService.getCart(req.user.id);
  return success(res, data, 'Cart retrieved');
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const data = await cartService.addToCart(req.user.id, productId, quantity ?? 1);
  return success(res, data, 'Item added to cart');
});

export const updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const data = await cartService.updateQuantity(req.user.id, productId, quantity);
  return success(res, data, 'Cart updated');
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const data = await cartService.removeFromCart(req.user.id, productId);
  return success(res, data, 'Item removed');
});
