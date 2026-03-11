/**
 * Product routes:
 * GET    /api/products – list (query: page, limit, category, brand, minPrice, maxPrice, sort)
 * GET    /api/products/categories – list categories
 * GET    /api/products/brands – list brands
 * GET    /api/products/:id – get one (must be before :id to avoid "categories" as id)
 * POST   /api/products – create (admin)
 * PATCH  /api/products/:id – update (admin)
 * DELETE /api/products/:id – delete (admin)
 */
import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';
import { uploadProductImage } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/hero', productController.getHeroProduct);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

router.post('/', uploadProductImage, productController.createProduct);
router.patch('/:id', uploadProductImage, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
