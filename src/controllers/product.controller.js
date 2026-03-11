/**
 * Product controller: CRUD and list with filters/pagination.
 */
import * as productService from '../services/product.service.js';
import { success, error } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  const uploadedFiles = [];
  if (req.files?.image?.length) uploadedFiles.push(...req.files.image);
  if (req.files?.images?.length) uploadedFiles.push(...req.files.images);

  if (uploadedFiles.length) {
    const imagePaths = uploadedFiles
      .filter((f) => f?.filename)
      .map((f) => `/asset/products/${f.filename}`);

    const existing = Array.isArray(body.images) ? body.images : body.images ? [body.images] : [];
    body.images = [...imagePaths, ...existing].filter(Boolean);
  }

  const data = await productService.createProduct(body);
  return success(res, data, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const data = await productService.updateProduct(req.params.id, req.body);
  return success(res, data, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  return success(res, null, 'Product deleted');
});

export const getProduct = asyncHandler(async (req, res) => {
  const data = await productService.getProductById(req.params.id);
  return success(res, data, 'Product retrieved');
});

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, category, brand, minPrice, maxPrice, sort } = req.query;
  const data = await productService.listProducts({
    page,
    limit,
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
  });
  return success(res, data, 'Products retrieved');
});

export const getHeroProduct = asyncHandler(async (req, res) => {
  const data = await productService.getHeroProduct();
  return success(res, data, data ? 'Hero product retrieved' : 'No hero product');
});

export const getCategories = asyncHandler(async (req, res) => {
  const data = await productService.getCategories();
  return success(res, data, 'Categories retrieved');
});

export const getBrands = asyncHandler(async (req, res) => {
  const data = await productService.getBrands();
  return success(res, data, 'Brands retrieved');
});
