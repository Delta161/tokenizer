import { Router } from 'express';
import * as passport from 'passport';
import {
  googleCallback,
  azureCallback,
  logout,
  getCurrentUser,
  refreshToken,
  authHealthCheck,
  handleAuthError
} from './auth.controller.js';
import { requireAuth } from './requireAuth.js';
import { googleAuthOptions, googleCallbackOptions } from './strategies/google.strategy.js';
import { azureAuthOptions, azureCallbackOptions } from './strategies/azure.strategy.js';
import { validateRequest } from './middleware/validateRequest.js';
import { RefreshTokenSchema } from './auth.validator.js';

const router = Router();

/**
 * Health check endpoint
 * GET /auth/health
 */
router.get('/health', authHealthCheck);

/**
 * Google OAuth routes
 */

/**
 * Initiate Google OAuth flow
 * GET /auth/google
 */
router.get('/google', 
  passport.authenticate('google', googleAuthOptions)
);

/**
 * Google OAuth callback
 * GET /auth/google/callback
 */
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: googleCallbackOptions.failureRedirect,
    session: false // We're using JWT, not sessions
  }),
  googleCallback
);

/**
 * Azure AD OAuth routes
 */

/**
 * Initiate Azure AD OAuth flow
 * GET /auth/azure
 */
router.get('/azure',
  passport.authenticate('azure-ad', azureAuthOptions)
);

/**
 * Azure AD OAuth callback
 * POST /auth/azure/callback
 * Note: Azure AD typically uses POST for callbacks
 */
router.post('/azure/callback',
  passport.authenticate('azure-ad', {
    failureRedirect: azureCallbackOptions.failureRedirect,
    session: false // We're using JWT, not sessions
  }),
  azureCallback
);

/**
 * Alternative GET route for Azure callback (some configurations might use GET)
 * GET /auth/azure/callback
 */
router.get('/azure/callback',
  passport.authenticate('azure-ad', {
    failureRedirect: azureCallbackOptions.failureRedirect,
    session: false
  }),
  azureCallback
);

/**
 * Authentication management routes
 */

/**
 * Get current authenticated user
 * GET /auth/me
 * Requires authentication
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * Logout current user
 * GET /auth/logout
 * Can be called with or without authentication
 */
router.get('/logout', logout);

/**
 * Alternative POST logout route
 * POST /auth/logout
 */
router.post('/logout', validateRequest(LogoutSchema), logout);

/**
 * Refresh access token using refresh token
 * POST /auth/refresh
 */
router.post('/refresh', validateRequest(RefreshTokenSchema), refreshToken);

/**
 * Error handling routes
 */

/**
 * Generic authentication error handler
 * GET /auth/error
 */
router.get('/error', (req, res) => {
  const error = req.query.error as string || 'Unknown authentication error';
  const message = req.query.message as string || 'An error occurred during authentication';
  
  handleAuthError(req, res, `${error}: ${message}`);
});

/**
 * Catch-all for unsupported OAuth providers
 * This helps with debugging and provides clear error messages
 */
router.get('/:provider', (req, res) => {
  const provider = req.params.provider;
  const supportedProviders = ['google', 'azure'];
  
  if (!supportedProviders.includes(provider)) {
    res.status(400).json({
      success: false,
      error: 'Unsupported provider',
      message: `OAuth provider '${provider}' is not supported. Supported providers: ${supportedProviders.join(', ')}`,
      supportedProviders
    });
    return;
  }
  
  // This shouldn't happen if routes are configured correctly
  res.status(500).json({
    success: false,
    error: 'Configuration error',
    message: `Provider '${provider}' is supported but not properly configured`
  });
});

/**
 * Error handling middleware for authentication routes
 */
router.use((error: Error, req: any, res: any, next: any) => {
  console.error('Authentication route error:', error);
  
  // Handle Passport-specific errors
  if (error.name === 'AuthenticationError') {
    handleAuthError(req, res, error.message);
    return;
  }
  
  // Handle other errors
  res.status(500).json({
    success: false,
    error: 'Authentication service error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An internal error occurred'
  });
});

export default router;

/**
 * Export route configuration for documentation
 */
export const authRouteConfig = {
  basePath: '/auth',
  routes: {
    health: 'GET /auth/health',
    googleAuth: 'GET /auth/google',
    googleCallback: 'GET /auth/google/callback',
    azureAuth: 'GET /auth/azure',
    azureCallback: 'POST /auth/azure/callback',
    azureCallbackAlt: 'GET /auth/azure/callback',
    currentUser: 'GET /auth/me',
    logout: 'GET /auth/logout',
    logoutPost: 'POST /auth/logout',
    refreshToken: 'POST /auth/refresh',
    error: 'GET /auth/error'
  },
  middleware: {
    requireAuth: 'Applied to /auth/me',
    passport: 'Applied to OAuth routes'
  }
};