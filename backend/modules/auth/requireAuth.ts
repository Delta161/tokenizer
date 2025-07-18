import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import { verifyToken, extractTokenFromRequest } from './jwt.js';
import { getUserById } from './auth.service.js';
import { isTokenBlacklisted } from './token.service.js';
import logger from './logger.js';

/**
 * Extended Request interface to include user information
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: any;
}

/**
 * Authentication middleware that verifies JWT tokens
 * Supports both cookie-based and Authorization header tokens
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from request (cookie or Authorization header)
    const token = extractTokenFromRequest(req);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No valid authentication token provided'
      });
      return;
    }
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      logger.securityEvent('Blacklisted token used', {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown'
      });
      
      res.status(401).json({
        error: 'Invalid token',
        message: 'This token has been revoked for security reasons',
        tokenStatus: 'revoked'
      });
      return;
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided authentication token is invalid or expired'
      });
      return;
    }

    // Get fresh user data from database to ensure user still exists and is active
    const user = await getUserById(decoded.id);

    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
      return;
    }

    // Attach user information to request object
    req.user = user;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    // Handle specific JWT errors
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError' || error.message === 'Token expired') {
        // Check if there's a valid refresh token
        const refreshToken = req.cookies?.refreshToken;
        
        if (refreshToken) {
          // Redirect to refresh token endpoint
          res.status(401).json({
            error: 'Token expired',
            message: 'Your authentication token has expired.',
            tokenStatus: 'expired',
            canRefresh: true
          });
        } else {
          // No refresh token available
          res.status(401).json({
            error: 'Token expired',
            message: 'Your authentication token has expired. Please log in again.',
            tokenStatus: 'expired',
            canRefresh: false
          });
        }
        return;
      }
      
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          error: 'Invalid token',
          message: 'The provided authentication token is malformed',
          tokenStatus: 'invalid'
        });
        return;
      }
    }

    // Generic authentication error
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Unable to authenticate the request'
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to requireAuth but doesn't fail if no token is provided
 * Useful for routes that have different behavior for authenticated vs anonymous users
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      // Invalid token, continue without user
      next();
      return;
    }

    const user = await getUserById(decoded.id);

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // For optional auth, we continue even if there's an error
    next();
  }
};

/**
 * Middleware to check if user is authenticated (simpler version)
 * Returns boolean instead of throwing errors
 */
export const isAuthenticated = (req: AuthenticatedRequest): boolean => {
  return !!req.user;
};

/**
 * Get current user from request
 * Useful utility function for controllers
 */
export const getCurrentUser = (req: AuthenticatedRequest) => {
  return req.user || null;
};