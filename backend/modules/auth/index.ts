import * as passport from 'passport';
import { configureGoogleStrategy } from './strategies/google.strategy.js';
import { configureAzureStrategy } from './strategies/azure.strategy.js';
import { scheduleBlacklistCleanup, stopBlacklistCleanup } from './token.service.js';
import authRoutes from './auth.routes.js';

/**
 * Initialize authentication module
 * This function should be called during application startup
 */
export const initializeAuth = (): void => {
  console.log('Initializing authentication module...');
  
  try {
    // Configure Passport strategies
    configureGoogleStrategy();
    configureAzureStrategy();
    
    // Configure Passport serialization (for session-based auth if needed)
    // Since we're using JWT, these are minimal implementations
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });
    
    passport.deserializeUser((id: string, done) => {
      // In JWT mode, this won't be called often
      // But it's required by Passport
      done(null, { id });
    });
    
    // Initialize token blacklist cleanup scheduler
    // This will periodically clean up expired tokens from the blacklist
    scheduleBlacklistCleanup();
    
    console.log('Authentication module initialized successfully');
  } catch (error) {
    console.error('Failed to initialize authentication module:', error);
    throw error;
  }
};

/**
 * Shutdown authentication module
 * This function should be called when the application is shutting down
 */
export const shutdownAuth = (): void => {
  console.log('Shutting down authentication module...');
  
  try {
    // Stop token blacklist cleanup scheduler
    stopBlacklistCleanup();
    
    console.log('Authentication module shutdown successfully');
  } catch (error) {
    console.error('Failed to shutdown authentication module:', error);
    throw error;
  }
};

/**
 * Export authentication routes
 */
export { default as authRoutes } from './auth.routes.js';

/**
 * Export middleware
 */
export { requireAuth, optionalAuth, isAuthenticated, getCurrentUser } from './requireAuth.js';
export {
  requireRole,
  requireMinRole,
  requireAdmin,
  requireClient,
  requireInvestor,
  requireOwnershipOrAdmin,
  hasRole,
  hasAnyRole,
  canAccessUserResource,
  getUserRole,
  isAdmin,
  isClientOrHigher
} from './requireRole.js';
export { validateRequest, validateParams, validateQuery } from './middleware/validateRequest.js';
export { UserRole } from '@prisma/client';

/**
 * Export services
 */
export {
  findUserByEmail,
  findUserByProviderId,
  createUser,
  findOrCreateUser,
  updateUserLoginMetadata,
  getUserById,
  cleanupExpiredSessions,
  type CreateUserData,
  type UserWithRole
} from './auth.service.js';

/**
 * Export JWT utilities
 */
export {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  extractTokenFromRequest,
  extractRefreshTokenFromRequest,
  setTokenCookies,
  clearTokenCookies,
  type JWTPayload,
  type RefreshTokenPayload
} from './jwt.js';

/**
 * Export token service utilities
 */
export {
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist,
  scheduleBlacklistCleanup,
  stopBlacklistCleanup
} from './token.service.js';

/**
 * Export OAuth profile utilities
 */
export {
  mapGoogleProfile,
  mapAzureProfile,
  mapOAuthProfile,
  validateNormalizedProfile,
  type NormalizedProfile,
  type GoogleProfile,
  type AzureProfile
} from './oauthProfileMapper.js';

/**
 * Export controllers (for custom route implementations)
 */
export {
  handleAuthSuccess,
  handleAuthError,
  googleCallback,
  azureCallback,
  logout,
  getCurrentUser as getCurrentUserController,
  refreshToken,
  authHealthCheck
} from './auth.controller.js';

/**
 * Export strategy configurations (for custom implementations)
 */
export {
  configureGoogleStrategy,
  googleAuthOptions,
  googleCallbackOptions
} from './strategies/google.strategy.js';
export {
  configureAzureStrategy,
  azureAuthOptions,
  azureCallbackOptions
} from './strategies/azure.strategy.js';

/**
 * Export route configuration for documentation
 */
export { authRouteConfig } from './auth.routes.js';

/**
 * Export validators
 */
export {
  RefreshTokenSchema,
  LogoutSchema,
  AuthErrorResponseSchema,
  AuthSuccessResponseSchema,
  TokenRefreshResponseSchema
} from './auth.validator.js';

/**
 * Export logger utilities
 */
export { default as logger } from './logger.js';
export {
  logUserLogin,
  logUserLogout,
  logUserRegistration,
  logAuthFailure,
  logAuthorizationFailure,
  logSecurityEvent,
  type LogLevel
} from './logger.js';

/**
 * Authentication module metadata
 */
export const authModuleInfo = {
  name: 'Authentication Module',
  version: '1.0.0',
  description: 'Production-grade OAuth 2.0 authentication module for Express.js',
  supportedProviders: ['google', 'azure-ad'],
  features: [
    'OAuth 2.0 authentication',
    'JWT token management',
    'Role-based access control',
    'Auto user provisioning',
    'Session management',
    'Refresh token support',
    'Token blacklisting',
    'Comprehensive middleware'
  ],
  requiredEnvironmentVariables: [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'AZURE_CLIENT_ID',
    'AZURE_CLIENT_SECRET',
    'AZURE_TENANT_ID (optional)',
    'FRONTEND_URL (optional)',
    'GOOGLE_CALLBACK_URL (optional)',
    'AZURE_REDIRECT_URL (optional)'
  ]
};