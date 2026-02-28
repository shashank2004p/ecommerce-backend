/**
 * Auth routes:
 * POST /api/auth/register – register
 * POST /api/auth/login – login
 * GET  /api/auth/profile – get profile (protected)
 * PATCH /api/auth/profile – update profile (protected)
 */
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRegister, validateLogin } from '../utils/validation.js';

const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;
