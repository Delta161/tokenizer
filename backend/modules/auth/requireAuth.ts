import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromRequest } from './jwt.js';
import { getUserById } from './auth.service.js';

/**
 * Extended Request interface to include user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: 'INVESTOR' | 'CLIENT' | 'ADMIN';
    authProvider: string;
  };
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
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      authProvider: user.authProvider
    };

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    // Handle specific JWT errors
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          error: 'Token expired',
          message: 'Your authentication token has expired. Please log in again.'
        });
        return;
      }
      
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          error: 'Invalid token',
          message: 'The provided authentication token is malformed'
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
      req.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        authProvider: user.authProvider
      };
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