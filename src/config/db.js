/**
 * MongoDB connection using Mongoose.
 */
import mongoose from 'mongoose';
import config from './index.js';

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoose.uri, {
      maxPoolSize: config.mongoose.poolSize,
    });
    if (config.env !== 'test') {
      console.log('MongoDB connected');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  if (config.env !== 'test') console.log('MongoDB disconnected');
});
