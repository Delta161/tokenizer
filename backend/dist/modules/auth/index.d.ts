/**
 * Initialize authentication module
 * This function should be called during application startup
 */
export declare const initializeAuth: () => void;
/**
 * Export authentication routes
 */
export { default as authRoutes } from './auth.routes.js';
/**
 * Export middleware
 */
export { requireAuth, optionalAuth, isAuthenticated, getCurrentUser } from './requireAuth.js';
export { requireRole, requireMinRole, requireAdmin, requireClient, requireInvestor, requireOwnershipOrAdmin, hasRole, hasAnyRole, canAccessUserResource, getUserRole, isAdmin, isClientOrHigher } from './requireRole.js';
export { UserRole } from '@prisma/client';
/**
 * Export services
 */
export { findUserByEmail, findUserByProviderId, createUser, findOrCreateUser, updateUserLoginMetadata, getUserById, cleanupExpiredSessions, type CreateUserData, type UserWithRole } from './auth.service.js';
/**
 * Export JWT utilities
 */
export { generateAccessToken, generateRefreshToken, verifyToken, extractTokenFromRequest, setTokenCookies, clearTokenCookies, type JWTPayload, type RefreshTokenPayload } from './jwt.js';
/**
 * Export OAuth profile utilities
 */
export { mapGoogleProfile, mapAzureProfile, mapOAuthProfile, validateNormalizedProfile, type NormalizedProfile, type GoogleProfile, type AzureProfile } from './oauthProfileMapper.js';
/**
 * Export controllers (for custom route implementations)
 */
export { handleAuthSuccess, handleAuthError, googleCallback, azureCallback, logout, getCurrentUser as getCurrentUserController, refreshToken, authHealthCheck } from './auth.controller.js';
/**
 * Export strategy configurations (for custom implementations)
 */
export { configureGoogleStrategy, googleAuthOptions, googleCallbackOptions } from './strategies/google.strategy.js';
export { configureAzureStrategy, azureAuthOptions, azureCallbackOptions } from './strategies/azure.strategy.js';
/**
 * Export route configuration for documentation
 */
export { authRouteConfig } from './auth.routes.js';
/**
 * Export logger utilities
 */
export { default as logger } from './logger.js';
export { logUserLogin, logUserLogout, logUserRegistration, logAuthFailure, logAuthorizationFailure, logSecurityEvent, type LogLevel } from './logger.js';
/**
 * Authentication module metadata
 */
export declare const authModuleInfo: {
    name: string;
    version: string;
    description: string;
    supportedProviders: string[];
    features: string[];
    requiredEnvironmentVariables: string[];
};
//# sourceMappingURL=index.d.ts.map