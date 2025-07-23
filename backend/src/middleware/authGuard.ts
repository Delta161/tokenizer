/**
 * Auth Guard Middleware
 * Protects routes that require authentication
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
const authService = new AuthService();

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
      res.status(401).json({ error: 'No token provided' });
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
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
};

/**
 * Role Guard Factory
 * Creates middleware to check if user has required role
 */
export const roleGuard = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user exists and has required role
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    // Continue to route handler
    next();
  };
};