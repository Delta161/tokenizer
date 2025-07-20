/**
 * Authentication Middleware
 * Provides middleware functions for route protection
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
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
 * Role Guard Middleware
 * Ensures user has required role(s)
 * @param roles - Array of allowed roles
 */
export const roleGuard = (roles: string[]) => {
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
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions',
        message: `This resource requires one of the following roles: ${roles.join(', ')}`
      });
      return;
    }
    
    // Continue to route handler
    next();
  };
};