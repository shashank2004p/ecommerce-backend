/**
 * Seed script: insert OnePlus Nord Buds 3r TWS Earbuds.
 * Run: node spsellbe/scripts/seed-nordbuds.js (from repo root) or npm run seed:nordbuds from spsellbe
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

const nordBudsProduct = {
  title: 'OnePlus Nord Buds 3r TWS Earbuds up to 54 Hours Playback, 2-mic Clear Calls, 3D Spatial Audio, AI Translation, 12.4mm Drivers, Dual-Device Connectivity, 47ms Low Latency - Ash Black',
  description: `OnePlus Nord Buds 3r – True Wireless Earbuds with up to 54 hours playback, 2-mic clear calls, 3D Spatial Audio, and AI Translation.

• Deal selling fast • Free delivery • 1-year warranty • 10-day replacement
• 12.4mm drivers • 47ms low latency • Dual-device connectivity • Bluetooth 5.4

Product information:
• Brand: OnePlus | Model: Nord Buds 3r (E517A) | Colour: Ash Black
• Form factor: In Ear | Ear placement: On Ear | Controls: Touch, Voice
• Battery: Up to 54 hours total | Charge time: 60 minutes
• Audio: 12.4mm dynamic drivers | 32 Ohms | 20 Hz–20 kHz | 112 dB sensitivity
• Connectivity: Bluetooth 5.4 | 10 m range | No jack (wireless)
• Features: AI Translation, 2-mic AI call noise cancellation, 3D Spatial Audio, Dual-Device Connectivity
• Water resistant | Enclosure: Silicone | Weight: 82 g
• Compatible: Android, iOS, Windows smartphones, tablets, computers, OnePlus smartphones
• Box: 3N Eartip, Safety & Warranty card, User Manual
• Country of Origin: Vietnam | Warranty: 1 year`,
  price: 1999,
  discount: 20,
  brand: 'OnePlus',
  category: 'headphones',
  images: [
    '/asset/boatairbuds/51egTAL1KeL._SL1500_.jpg',
    '/asset/boatairbuds/51INkBdsfmL._SL1500_.jpg',
    '/asset/boatairbuds/51nBTTG3hNL._SL1500_.jpg',
    '/asset/boatairbuds/51pXbO6l8YL._SL1500_.jpg',
    '/asset/boatairbuds/51v5aO39GKL._SL1500_.jpg',
    '/asset/boatairbuds/61-jZrphNyL._SL1500_.jpg',
    '/asset/boatairbuds/61EdtkK4tmL._SL1500_.jpg',
    '/asset/boatairbuds/61y+CI64GAL._SL1500_.jpg',
  ],
  stock: 80,
  isHero: false,
  specifications: [
    { label: 'Brand', value: 'OnePlus' },
    { label: 'Model Name', value: 'OnePlus Nord Buds 3r' },
    { label: 'Model Number', value: 'E517A' },
    { label: 'Colour', value: 'Ash Black' },
    { label: 'Form Factor', value: 'In Ear' },
    { label: 'Ear Placement', value: 'On Ear' },
    { label: 'Impedance', value: '32 Ohms' },
    { label: 'Battery Life', value: 'Up to 54 hours' },
    { label: 'Charge Time', value: '60 minutes' },
    { label: 'Driver Size', value: '12.4mm Dynamic' },
    { label: 'Bluetooth', value: '5.4' },
    { label: 'Low Latency', value: '47ms' },
    { label: 'Features', value: 'AI Translation, 2-mic AI Call Noise Cancellation, 3D Spatial Audio, Dual-Device Connectivity' },
    { label: 'Water Resistance', value: 'Water Resistant' },
    { label: 'Warranty', value: '1 year' },
    { label: 'Box Contents', value: '3N Eartip, Safety & Warranty card, User Manual' },
    { label: 'Country of Origin', value: 'Vietnam' },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const existing = await Product.findOne({ title: nordBudsProduct.title });
    if (existing) {
      await Product.findByIdAndUpdate(existing._id, nordBudsProduct);
      console.log('OnePlus Nord Buds 3r updated:', existing._id.toString());
    } else {
      const created = await Product.create(nordBudsProduct);
      console.log('OnePlus Nord Buds 3r created:', created._id.toString());
    }
    console.log('Title:', nordBudsProduct.title.substring(0, 60) + '...');
    console.log('Price: ₹' + nordBudsProduct.price + ' (after ' + nordBudsProduct.discount + '% off: ₹' + Math.round(nordBudsProduct.price * (1 - nordBudsProduct.discount / 100)) + ')');
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
