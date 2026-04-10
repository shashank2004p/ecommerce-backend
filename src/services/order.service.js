/**
 * Order service: place order (online payment placeholder), get user orders, get single order.
 */
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

function toOrderItemResponse(item) {
  const product = item.productId;
  const isPopulated = product && typeof product === 'object' && product.title != null;
  return {
    productId: (product?._id || item.productId)?.toString(),
    quantity: item.quantity,
    priceAtOrder: item.priceAtOrder,
    product: isPopulated
      ? { id: product._id?.toString(), name: product.title, price: item.priceAtOrder }
      : undefined,
  };
}

function toOrderResponse(order) {
  const o = order.toObject ? order.toObject() : order;
  const items = (o.items || []).map(toOrderItemResponse);
  return {
    id: o._id.toString(),
    userId: o.userId?.toString(),
    address: o.address,
    items,
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    razorpayOrderId: o.razorpayOrderId,
    razorpayPaymentId: o.razorpayPaymentId,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export async function createOrder(userId, { address, items, total, paymentMethod }) {
  if (!items?.length) {
    const err = new Error('Order must have at least one item');
    err.statusCode = 400;
    throw err;
  }
  const productIds = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let computedTotal = 0;
  for (const { productId, quantity } of items) {
    const id = productId?.toString?.() || productId;
    const product = productMap.get(id);
    if (!product) {
      const err = new Error(`Product not found: ${productId}`);
      err.statusCode = 400;
      throw err;
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const priceAtOrder = product.discount > 0
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;
    orderItems.push({ productId: product._id, quantity: qty, priceAtOrder });
    computedTotal += priceAtOrder * qty;
  }

  // Never trust totals coming from the client.
  // Total is derived from current product prices/discounts at order time.
  const order = await Order.create({
    userId: userId || undefined,
    address: address || {},
    items: orderItems,
    total: computedTotal,
    paymentMethod: 'online',
    paymentStatus: 'pending',
    status: 'pending',
  });
  return toOrderResponse(order);
}

const DEFAULT_ORDER_PAGE_SIZE = 20;
const MAX_ORDER_PAGE_SIZE = 100;

export async function getOrdersByUser(userId, { page = 1, limit = DEFAULT_ORDER_PAGE_SIZE } = {}) {
  const skip = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, MAX_ORDER_PAGE_SIZE));
  const size = Math.max(1, Math.min(limit, MAX_ORDER_PAGE_SIZE));
  const [orders, total] = await Promise.all([
    Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .populate('items.productId', 'title price discount')
      .lean(),
    Order.countDocuments({ userId }),
  ]);
  return {
    orders: orders.map(toOrderResponse),
    pagination: {
      page: Math.max(1, page),
      limit: size,
      total,
      totalPages: Math.ceil(total / size) || 1,
    },
  };
}

export async function getOrderById(orderId, userId) {
  const order = await Order.findById(orderId).populate('items.productId').lean();
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  if (userId && order.userId && order.userId.toString() !== userId) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return toOrderResponse(order);
}
