/**
 * Cart service: add, remove, update quantity, get cart (with product details).
 */
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

function toProductResponse(p) {
  if (!p) return null;
  const salePrice = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
  return {
    id: p._id.toString(),
    name: p.title,
    title: p.title,
    price: p.price,
    salePrice,
    discount: p.discount,
    brand: p.brand,
    category: p.category,
    images: p.images || [],
    image: (p.images && p.images[0]) || null,
    stock: p.stock,
    inStock: p.stock > 0,
  };
}

export async function getCart(userId) {
  let cart = await Cart.findOne({ userId }).populate('items.productId').lean();
  if (!cart) {
    await Cart.create({ userId, items: [] });
    cart = { items: [] };
  }
  const items = (cart.items || []).map((item) => {
    const product = item.productId;
    return {
      product: product ? toProductResponse(product) : null,
      quantity: item.quantity,
    };
  }).filter((i) => i.product);
  return { items };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

export async function addToCart(userId, productId, quantity = 1) {
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });

  const existing = cart.items.find((i) => i.productId.toString() === productId);
  if (existing) {
    existing.quantity += Math.max(1, quantity);
  } else {
    cart.items.push({ productId, quantity: Math.max(1, quantity) });
  }
  await cart.save();
  return getCart(userId);
}

export async function updateQuantity(userId, productId, quantity) {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const err = new Error('Cart not found');
    err.statusCode = 404;
    throw err;
  }
  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) {
    const err = new Error('Item not in cart');
    err.statusCode = 404;
    throw err;
  }
  if (quantity < 1) {
    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  return getCart(userId);
}

export async function removeFromCart(userId, productId) {
  const cart = await Cart.findOne({ userId });
  if (!cart) return getCart(userId);
  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  await cart.save();
  return getCart(userId);
}
