/**
 * Product model: title, description, price, discount, brand, category, images, stock.
 * Frontend expects: name (from title), price, salePrice (computed), images, inStock (from stock).
 */
import mongoose from 'mongoose';

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

// Listing with filters and sort by price
productSchema.index({ category: 1, brand: 1, price: 1 });
// Newest first / "new arrivals"
productSchema.index({ createdAt: -1 });
// Category + newest (category listing default sort)
productSchema.index({ category: 1, createdAt: -1 });
// Hero product single lookup
productSchema.index({ isHero: 1 }, { sparse: true });
// Text search (optional; enable if you add search)
// productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
