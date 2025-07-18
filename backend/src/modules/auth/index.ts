/**
 * Auth Module Index
 * Exports all components of the auth module and initializes authentication strategies
 */

import * as passport from 'passport';
import { authRouter } from './auth.routes';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { scheduleBlacklistCleanup, stopBlacklistCleanup, loadBlacklistedTokens } from './token.service';
import './strategies/google.strategy';
import './strategies/azure.strategy';

/**
 * Initialize authentication module
 * This function should be called during application startup
 */
export const initializeAuth = async (): Promise<void> => {
  console.log('Initializing authentication module...');
  
  try {
    // Configure Passport serialization (for session-based auth if needed)
    passport.serializeUser((user: any, done) => {
      done(null, user);
    });
    
    passport.deserializeUser((obj: any, done) => {
      // In JWT mode, this won't be called often
      // But it's required by Passport
      done(null, obj);
    });
    
    // Load blacklisted tokens into memory
    await loadBlacklistedTokens();
    
    // Initialize token blacklist cleanup scheduler
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

export {
  authRouter,
  AuthController,
  AuthService
};

// Export types
export * from './auth.types';

// Export validators
export * from './auth.validators';

// Export auth guards and utilities
export { authGuard, roleGuard } from '../../middleware/authGuard';
export { generateAccessToken, generateRefreshToken, verifyToken, extractTokenFromRequest, setTokenCookies, clearTokenCookies } from './jwt';
export { blacklistToken, isTokenBlacklisted, cleanupBlacklist } from './token.service';
export { mapOAuthProfile, validateNormalizedProfile } from './oauthProfileMapper';