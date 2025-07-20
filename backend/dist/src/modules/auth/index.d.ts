/**
 * Auth Module Index
 * Exports all components of the auth module and initializes authentication strategies
 */
import { authRouter } from './auth.routes';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import './strategies/google.strategy';
import './strategies/azure.strategy';
/**
 * Initialize authentication module
 * This function should be called during application startup
 */
export declare const initializeAuth: () => Promise<void>;
/**
 * Shutdown authentication module
 * This function should be called when the application is shutting down
 */
export declare const shutdownAuth: () => void;
export { authRouter, AuthController, AuthService };
export * from './auth.types';
export * from './auth.validators';
export { authGuard, roleGuard } from './auth.middleware';
export { generateAccessToken, generateRefreshToken, verifyToken, extractTokenFromRequest, setTokenCookies, clearTokenCookies } from './jwt';
export { blacklistToken, isTokenBlacklisted, cleanupBlacklist } from './token.service';
export { mapOAuthProfile, validateNormalizedProfile } from './oauthProfileMapper';
//# sourceMappingURL=index.d.ts.map