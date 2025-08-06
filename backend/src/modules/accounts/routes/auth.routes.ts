/**
 * Auth Routes
 * Authentication routes with OAuth integration
 */

// External packages
import { Router } from 'express';
import passport from 'passport';

// Internal modules - Use relative imports
import { authController } from '../controllers/auth.controller';
import { sessionGuard, optionalSession } from '../middleware/session.middleware';
import { googleAuthOptions, googleCallbackOptions } from '../strategies/google.strategy';
import { 
  healthCheckEndpoint, 
  livenessEndpoint, 
  readinessEndpoint 
} from '../middleware/health-check.middleware';
import { generalRateLimit } from '../middleware/rate-limit.middleware';

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
 * Advanced health check endpoint
 */
router.get('/health/detailed', generalRateLimit, healthCheckEndpoint);

/**
 * Liveness probe for Kubernetes/Docker
 */
router.get('/health/live', livenessEndpoint);

/**
 * Readiness probe for Kubernetes/Docker
 */
router.get('/health/ready', readinessEndpoint);

/**
 * Session status check endpoint
 */
router.get('/session-status', authController.getSessionStatus.bind(authController));

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
router.post('/logout', sessionGuard, authController.logout.bind(authController));

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
