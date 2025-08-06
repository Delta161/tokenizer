/**
 * User Authorization Middleware
 * Provides role-based access control for authenticated users
 * Works with session-based authentication
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { logger } from '../../../utils/logger';

/**
 * Extended request interface with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    clientId?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Role-based authorization middleware
 * Requires specific roles to access the route
 * 
 * @param allowedRoles Array of roles that can access this route
 * @returns Express middleware function
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated (should be handled by requireAuth first)
      if (!req.user) {
        logger.warn('❌ Role check failed - no authenticated user', {
          path: req.path,
          method: req.method,
          ip: req.ip,
          allowedRoles
        });
        
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to access this resource',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Check if user has required role
      const userRole = req.user.role;
      const hasPermission = allowedRoles.includes(userRole);

      if (!hasPermission) {
        logger.warn('❌ Role authorization failed', {
          userId: req.user.id,
          userRole,
          allowedRoles,
          path: req.path,
          method: req.method,
          ip: req.ip
        });

        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      // Authorization successful
      logger.debug('✅ Role authorization successful', {
        userId: req.user.id,
        userRole,
        allowedRoles,
        path: req.path,
        method: req.method
      });

      return next();

    } catch (error) {
      logger.error('❌ Role middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        allowedRoles
      });

      res.status(500).json({
        success: false,
        error: 'Authorization system error',
        message: 'An error occurred during authorization',
        code: 'AUTH_SYSTEM_ERROR'
      });
      return;
    }
  };
};

/**
 * Check if user has specific role (utility function)
 */
export const hasRole = (user: AuthenticatedRequest['user'], role: UserRole): boolean => {
  return user?.role === role;
};

/**
 * Check if user has any of the specified roles (utility function)
 */
export const hasAnyRole = (user: AuthenticatedRequest['user'], roles: UserRole[]): boolean => {
  return user ? roles.includes(user.role) : false;
};

/**
 * Admin-only middleware shorthand
 */
export const requireAdmin = requireRole([UserRole.ADMIN]);

/**
 * Client-only middleware shorthand  
 */
export const requireClient = requireRole([UserRole.CLIENT]);

/**
 * Client or Admin middleware shorthand
 */
export const requireClientOrAdmin = requireRole([UserRole.CLIENT, UserRole.ADMIN]);