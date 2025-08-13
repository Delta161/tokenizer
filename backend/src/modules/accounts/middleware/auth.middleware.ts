/**
 * Authentication Middleware
 * Session-based authentication for the accounts module
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

/**
 * Session-based authentication guard
 * Validates that user is authenticated via session
 */
export const sessionGuard = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  try {
    // Check if user is authenticated via Passport session
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const processingTime = Date.now() - startTime;
      
      logger.info('✅ Session authentication successful', {
        userId: (req.user as any).id,
        processingTime,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      return next();
    }
    
    // Authentication failed
    const processingTime = Date.now() - startTime;
    
    logger.warn('❌ Session authentication failed', {
      hasSession: !!req.session,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      hasUser: !!req.user,
      sessionID: req.sessionID,
      processingTime,
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource',
      code: 'SESSION_REQUIRED'
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('❌ Session guard error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
      ip: req.ip,
      path: req.path
    });
    
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional session authentication
 * Sets req.user if session exists, but doesn't require authentication
 */
export const optionalSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Just continue - optionally populate user if authenticated
    next();
  } catch (error) {
    logger.error('❌ Optional session error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      path: req.path
    });
    next(); // Continue anyway since this is optional
  }
};

/**
 * Legacy aliases for compatibility
 */
export const requireAuth = sessionGuard;
export const authGuard = sessionGuard;
export const optionalAuth = optionalSession;

/**
 * Re-export types and functions from user.middleware for convenience
 * Note: AuthenticatedRequest is a TypeScript type, so export it as a type-only export
 * to prevent runtime ESM export errors.
 */
export type { AuthenticatedRequest } from './user.middleware';
export { requireRole, requireAdmin, requireClient, requireClientOrAdmin } from './user.middleware';
