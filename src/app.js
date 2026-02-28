/**
 * Express app: security, CORS, JSON, API routes, central error handler.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import config from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust proxy when behind reverse proxy (e.g. Nginx, Railway, Render)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// Rate limiting: 100 requests per 15 min per IP (stricter for auth/orders if needed)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests', data: null },
});
app.use('/api', apiLimiter);

// Stricter limit for auth and order creation
const authOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts', data: null },
});
app.use('/api/auth/login', authOrderLimiter);
app.use('/api/auth/register', authOrderLimiter);
app.use('/api/orders', authOrderLimiter);

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing: larger limit for orders, then default
app.use('/api/orders', express.json({ limit: '500kb' }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Static assets (product images)
app.use('/asset', express.static(path.join(__dirname, '..', 'asset')));

// Health: liveness (server up)
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), env: config.env });
});

// Readiness: DB connected (for orchestrators / k8s)
app.get('/ready', (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ ok: false, reason: 'Database not connected' });
  }
  res.json({ ok: true });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404 for unknown API paths
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found', data: null });
});

app.use(errorHandler);

export default app;
