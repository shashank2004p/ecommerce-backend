/**
 * Environment-based configuration.
 * In production, required env vars are validated on load.
 */
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

function requireEnv(name) {
  const v = process.env[name];
  if (isProd && (v === undefined || v === '')) {
    throw new Error(`Missing required env in production: ${name}`);
  }
  return v;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoose: {
    // prefer the provided URI but fall back to localhost when developing
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/spsell',
    poolSize: parseInt(process.env.MONGODB_POOL_SIZE, 10) || 10,
  },
  jwt: {
    secret: requireEnv('JWT_SECRET') || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
      : (isProd ? [] : ['http://localhost:5173']),
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
};

if (isProd) {
  // Mongo URI is required when actually running for real; failing early avoids
  // crashing deep in Mongoose later.
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set in production');
  }
  if (!config.cors.origin.length) {
    throw new Error('CORS_ORIGIN must be set in production (comma-separated frontend URLs)');
  }
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in production');
  }
}

export default config;
