/**
 * Authentication Middleware
 * Provides middleware functions for route protection
 */

// External packages
import { NextFunction, Request, Response } from 'express';

// Internal modules
import { authService } from '@modules/accounts/services/auth.service';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Extended request interface with user property
export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Auth Guard Middleware
 * Verifies JWT token and attaches user to request
 */
export const authGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        message: 'No valid authentication token provided'
      });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const user = await authService.verifyToken(token);
    
    // Attach user to request
    req.user = user;
    
    // Continue to route handler
    next();
  } catch (error: any) {
    res.status(401).json({ 
      success: false,
      error: 'Authentication failed',
      message: error.message || 'Invalid authentication token'
    });
  }
};

/**
 * Aliases for authGuard for backward compatibility
 */
export const requireAuth = authGuard;
export const isAuthenticated = authGuard;

/**
 * Role Guard Middleware
 * Ensures user has required role(s)
 * @param roles - Array of allowed roles
 */
export const roleGuard = (roles: string[] | string) => {
  // Convert single role to array for backward compatibility
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user exists and has required role
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
      return;
    }
    
    if (!roleArray.includes(req.user.role)) {
      res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions',
        message: `This resource requires one of the following roles: ${roleArray.join(', ')}` 
      });
      return;
    }
    
    // Continue to route handler
    next();
  };
};

/**
 * Aliases for roleGuard for backward compatibility
 */
export const requireRole = roleGuard;
export const hasRole = roleGuard;

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const user = await authService.verifyToken(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue even if token is invalid
    next();
  }
};
