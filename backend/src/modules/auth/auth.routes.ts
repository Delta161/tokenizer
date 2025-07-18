/**
 * Auth Routes
 * Defines routes for the auth module
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { authGuard } from '../../middleware/authGuard';

// Create router
const router = Router();

// Register routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/profile', authGuard, authController.getProfile.bind(authController));
router.post('/verify-token', authController.verifyToken.bind(authController));

export { router as authRouter };