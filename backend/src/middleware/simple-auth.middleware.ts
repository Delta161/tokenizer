/**
 * Simple Authentication Middleware
 * For user profile routes - validates token presence
 */

import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include user property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

/**
 * Simple Auth Middleware
 * Validates that a Bearer token is present in the Authorization header
 * For now, just checks token existence - can be enhanced later with real JWT validation
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required - no token provided',
      errorCode: 'AUTH_TOKEN_MISSING',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // For now, just validate token exists (can be enhanced with JWT verification later)
  if (token.length < 10) {
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
      errorCode: 'AUTH_TOKEN_INVALID',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Token is valid, continue to next middleware/route handler
  next();
};

/**
 * Optional Auth Middleware
 * Allows access whether token is present or not
 * Useful for routes that work differently for authenticated vs anonymous users
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  // Set a flag indicating if user is authenticated
  (req as any).isAuthenticated = !!token;
  
  next();
};
