/**
 * Seed script: insert Samsung 20000mAh Power Bank as first hero product.
 * Run from repo root: node spsellbe/scripts/seed-powerbank.js
 * Ensure MONGODB_URI is set or defaults to mongodb://localhost:27017/spsell
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spsell';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    isHero: { type: Boolean, default: false },
    specifications: [{ label: String, value: String }],
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const heroProduct = {
  title: 'Samsung Galaxy 20000mAh Power Bank, Wired Battery Pack, Gray',
  description: `Samsung Galaxy 20000mAh Power Bank – reliable wired battery pack in Gray. Ideal for travel and daily use.

• Free delivery • 7-day return • 3-year warranty • Fast delivery • 3-day delivery available
• 1 charging cable free with this product

Product information:
• Package dimensions: 18 x 10.3 x 3.6 cm; 402 g
• Batteries: 4 Lithium Ion batteries (included)
• Item model number: EB-P4520
• Special features: Fast Charging, LED Indicator Lights, Over Charging Protection
• Battery: 20000 mAh
• Manufacturer: Samsung
• Country of Origin: China
• Connector type: USB
• Colour: Gray`,
  price: 4999,
  discount: 18,
  brand: 'Samsung',
  category: 'powerbanks',
  images: [
    '/asset/sampower.jpg',
    '/asset/61Tw27Q8G0L._SL1500_.jpg',
    '/asset/71bveoiH8CL._SL1500_.jpg',
    '/asset/71EDU0bT7YL._SL1500_.jpg',
    '/asset/71g9pongOJL._SL1500_.jpg',
    '/asset/71r4elcThzL._SL1500_.jpg',
  ],
  stock: 100,
  isHero: true,
  specifications: [
    { label: 'Brand', value: 'Samsung' },
    { label: 'Battery Capacity', value: '20000 mAh' },
    { label: 'Colour', value: 'Gray' },
    { label: 'Connector Type', value: 'USB' },
    { label: 'Special Features', value: 'Fast Charging, LED Indicator Lights, Over Charging Protection' },
    { label: 'Item Model Number', value: 'EB-P4520' },
    { label: 'Package Dimensions', value: '18 x 10.3 x 3.6 cm' },
    { label: 'Item Weight', value: '402 g' },
    { label: 'Warranty', value: '3 Year Warranty' },
    { label: 'In the Box', value: '1 Power Bank, 1 Charging Cable (Free)' },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const existing = await Product.findOne({ isHero: true });
    if (existing) {
      await Product.findByIdAndUpdate(existing._id, { isHero: false });
      console.log('Unset previous hero product');
    }

    const created = await Product.create(heroProduct);
    console.log('Hero product created:', created._id.toString());
    console.log('Title:', created.title);
    console.log('Price: ₹' + created.price + ' (after ' + created.discount + '% off: ₹' + Math.round(created.price * (1 - created.discount / 100)) + ')');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  }
}

seed();
