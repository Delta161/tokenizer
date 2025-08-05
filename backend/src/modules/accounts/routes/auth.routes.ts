/**
 * Auth Routes
 * Authentication routes with OAuth integration
 */

// External packages
import { Router } from 'express';
import passport from 'passport';

// Internal modules - Use relative imports
import { authController } from '../controllers/auth.controller';
import { authGuard, optionalAuth } from '../middleware/auth.middleware';
import { googleAuthOptions, googleCallbackOptions } from '../strategies/google.strategy';

// Global utilities
import { logger } from '../../../utils/logger';

// Create router
const router = Router();

logger.info('✅ Auth routes module loading...');

// =============================================================================
// HEALTH & STATUS ENDPOINTS
// =============================================================================

/**
 * Health check endpoint
 */
router.get('/health', authController.healthCheck.bind(authController));

/**
 * Token verification endpoint
 */
router.get('/verify-token', authController.verifyToken.bind(authController));
router.post('/verify-token', authController.verifyToken.bind(authController));

// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

/**
 * Get current user profile (requires authentication)
 */
router.get('/profile', authGuard, authController.getProfile.bind(authController));

/**
 * Refresh access token
 */
router.post('/refresh-token', authController.refreshToken.bind(authController));

/**
 * Logout user
 */
router.post('/logout', optionalAuth, authController.logout.bind(authController));

// =============================================================================
// GOOGLE OAUTH ENDPOINTS
// =============================================================================

/**
 * Google OAuth initiation
 */
router.get('/google', 
  passport.authenticate('google', googleAuthOptions)
);

/**
 * Google OAuth callback
 */
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '/auth/error?provider=google' 
  }),
  authController.handleOAuthSuccess.bind(authController)
);

// =============================================================================
// AZURE OAUTH ENDPOINTS
// =============================================================================

/**
 * Azure OAuth initiation
 */
router.get('/azure',
  passport.authenticate('azure-ad', {
    failureRedirect: process.env.FRONTEND_URL + '/auth/error?provider=azure'
  })
);

/**
 * Azure OAuth callback
 */
router.get('/azure/callback',
  passport.authenticate('azure-ad', {
    failureRedirect: process.env.FRONTEND_URL + '/auth/error?provider=azure'
  }),
  authController.handleOAuthSuccess.bind(authController)
);

// =============================================================================
// ERROR HANDLING ENDPOINTS
// =============================================================================

/**
 * OAuth error handler
 */
router.get('/error', authController.handleOAuthError.bind(authController));

export { router as authRouter };

logger.info('✅ Auth routes configured successfully');
