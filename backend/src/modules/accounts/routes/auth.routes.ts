/**
 * Auth Routes
 * Authentication routes with OAuth integration
 */

// External packages
import { Router } from 'express';
import passport from 'passport';

// Internal modules - Use relative imports
import { authController } from '../controllers/auth.controller';
import { sessionGuard, optionalSession } from '../middleware/auth.middleware';
import { googleAuthOptions, googleCallbackOptions } from '../strategies/google.strategy';

// Global utilities
import { logger } from '../../../utils/logger';
import { authLimiter, apiLimiter } from '../../../middleware/rate-limit/rate-limit.middleware';

// Create router
const router = Router();

logger.info('✅ Auth routes module loading...');

// =============================================================================
// HEALTH & STATUS ENDPOINTS
// =============================================================================

/**
 * Health check endpoint
 */
router.get('/health', apiLimiter, authController.healthCheck.bind(authController));

/**
 * Session status check endpoint
 */
router.get('/session-status', apiLimiter, authController.getSessionStatus.bind(authController));

/**
 * Debug session endpoint (temporary - for troubleshooting)
 */
router.get('/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session
  });
});

// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

/**
 * Logout user - destroy session
 */
router.post('/logout', apiLimiter, sessionGuard, authController.logout.bind(authController));

// =============================================================================
// GOOGLE OAUTH ENDPOINTS
// =============================================================================

/**
 * Google OAuth initiation
 */
router.get('/google', 
  authLimiter, // Apply stricter rate limiting for auth endpoints
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
