/**
 * Session-Based Authentication Middleware
 * 
 * This middleware replaces JWT-based authentication with pure Passport sessions.
 * Following backend coding instructions for session-only authentication.
 * 
 * IMPORTANT: This middleware works with Passport's req.isAuthenticated() method
 * and requires proper session configuration.
 */

// External packages
import { Request, Response, NextFunction } from 'express';

// Internal modules
import { logger } from '../../../utils/logger';

/**
 * Session-based authentication guard
 * Replaces JWT-based authGuard with session validation
 */
export const sessionGuard = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  try {
    // Check if user is authenticated via Passport session
    if (req.isAuthenticated() && req.user) {
      const processingTime = Date.now() - startTime;
      
      logger.debug('✅ Session authentication successful', {
        userId: req.user.id,
        email: req.user.email,
        processingTime,
        sessionID: req.sessionID,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return next();
    }
    
    // Authentication failed
    const processingTime = Date.now() - startTime;
    
    logger.warn('❌ Session authentication failed', {
      hasSession: !!req.session,
      isAuthenticated: req.isAuthenticated(),
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
      error: 'Authentication system error',
      message: 'An error occurred during authentication',
      code: 'SESSION_ERROR'
    });
  }
};

/**
 * Role-based authorization middleware
 * Requires authentication and specific user role
 */
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    try {
      // First check authentication
      if (!req.isAuthenticated() || !req.user) {
        logger.warn('❌ Role check failed - not authenticated', {
          requiredRole: role,
          processingTime: Date.now() - startTime,
          ip: req.ip
        });
        
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }
      
      // Check role
      if (req.user.role !== role) {
        logger.warn('❌ Role check failed - insufficient privileges', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRole: role,
          processingTime: Date.now() - startTime,
          ip: req.ip
        });
        
        res.status(403).json({
          success: false,
          message: 'Insufficient privileges'
        });
        return;
      }
      
      logger.debug('✅ Role check successful', {
        userId: req.user.id,
        role: req.user.role,
        processingTime: Date.now() - startTime
      });
      
      return next();
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('❌ Role check error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requiredRole: role,
        processingTime
      });
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
      return;
    }
  };
};

/**
 * Optional session authentication
 * Sets req.user if session exists, but doesn't require authentication
 */
export const optionalSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (req.isAuthenticated() && req.user) {
      logger.debug('✅ Optional session found user', {
        userId: req.user.id,
        sessionID: req.sessionID
      });
    } else {
      logger.debug('ℹ️ Optional session - no authenticated user', {
        hasSession: !!req.session,
        sessionID: req.sessionID
      });
    }
    
    return next();
  } catch (error) {
    logger.error('❌ Optional session error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Continue anyway for optional auth
    return next();
  }
};

/**
 * Legacy compatibility aliases
 * Maintains backward compatibility while transitioning to session-based auth
 */
export const requireAuth = sessionGuard;
export const authGuard = sessionGuard; // Temporary alias during transition
export const optionalAuth = optionalSession;
