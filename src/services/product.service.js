/**
 * Product service: CRUD, list with filters (category, brand, price range), pagination.
 * Maps model to frontend shape: name (from title), salePrice (from price & discount), inStock (from stock), image (first of images).
 */
import Product from '../models/Product.model.js';

function toProductResponse(p) {
  const salePrice = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
  return {
    id: p._id.toString(),
    name: p.title,
    title: p.title,
    description: p.description,
    price: p.price,
    discount: p.discount,
    salePrice,
    brand: p.brand,
    category: p.category,
    images: p.images && p.images.length ? p.images : [],
    image: (p.images && p.images[0]) || null,
    stock: p.stock,
    inStock: p.stock > 0,
    isHero: !!p.isHero,
    specifications: p.specifications && p.specifications.length ? p.specifications : undefined,
    createdAt: p.createdAt,
  };
}

export async function createProduct(body) {
  const product = await Product.create(body);
  return toProductResponse(product);
}

export async function updateProduct(id, body) {
  const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return toProductResponse(product);
}

export async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true };
}

export async function getProductById(id) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return toProductResponse(product);
}

export async function listProducts({ page = 1, limit = 12, category, brand, minPrice, maxPrice, sort }) {
  const filter = {};
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = Number(minPrice);
    if (maxPrice != null) filter.price.$lte = Number(maxPrice);
  }

  let query = Product.find(filter);
  if (sort === 'price_asc') query = query.sort({ price: 1 });
  else if (sort === 'price_desc') query = query.sort({ price: -1 });
  else if (sort === 'newest') query = query.sort({ createdAt: -1 });
  else query = query.sort({ createdAt: -1 });

  const skip = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, 100));
  const [products, total] = await Promise.all([
    query.skip(skip).limit(Math.max(1, Math.min(limit, 100))).lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: products.map(toProductResponse),
    pagination: {
      page: Math.max(1, page),
      limit: Math.max(1, Math.min(limit, 100)),
      total,
      totalPages: Math.ceil(total / Math.max(1, Math.min(limit, 100))),
    },
  };
}

export async function getHeroProduct() {
  const product = await Product.findOne({ isHero: true }).lean();
  if (!product) return null;
  return toProductResponse(product);
}

export async function getCategories() {
  const list = await Product.distinct('category');
  return list.sort().map((c) => ({ id: c, name: c, slug: c }));
}

export async function getBrands() {
  const list = await Product.distinct('brand');
  return list.sort();
}
