/**
 * Auth Routes
 * Defines authentication routes
 */

// External packages
import { Router } from 'express';
import passport from 'passport';

// Internal modules
import { authController } from '@modules/accounts/controllers/auth.controller';
import { authGuard } from '@modules/accounts/middleware/auth.middleware';

// Create router
const router = Router();

// Health check
router.get('/health', authController.healthCheck.bind(authController));

// Only OAuth authentication is supported
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.get('/profile', authGuard, authController.getProfile.bind(authController));
router.post('/verify-token', authController.verifyToken.bind(authController));

// OAuth routes

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: process.env.AUTH_ERROR_REDIRECT_PATH || '/auth/error' }),
  authController.handleOAuthSuccess.bind(authController)
);

// Azure OAuth
router.get('/azure', passport.authenticate('azure-ad-oauth2', {
  scope: ['profile', 'email', 'openid']
}));

router.get('/azure/callback', 
  passport.authenticate('azure-ad-oauth2', { session: false, failureRedirect: process.env.AUTH_ERROR_REDIRECT_PATH || '/auth/error' }),
  authController.handleOAuthSuccess.bind(authController)
);

// Handle OAuth errors
router.get('/error', authController.handleOAuthError.bind(authController));

export { router as authRouter };