import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from './requireAuth.js';

/**
 * Role hierarchy for permission checking
 * Higher numbers indicate higher privileges
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.INVESTOR]: 1,
  [UserRole.CLIENT]: 2,
  [UserRole.ADMIN]: 3
};

/**
 * Check if a user has a specific role or higher
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Check if a user has any of the specified roles
 */
export const hasAnyRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

/**
 * Middleware factory to require specific role(s)
 * Usage: requireRole('ADMIN') or requireRole(['CLIENT', 'ADMIN'])
 */
export const requireRole = (allowedRoles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated first
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
      return;
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Check if user has any of the required roles
    if (!hasAnyRole(userRole, rolesArray)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required role(s): ${rolesArray.join(', ')}. Your role: ${userRole}`,
        requiredRoles: rolesArray,
        userRole
      });
      return;
    }

    // User has required role, continue
    next();
  };
};

/**
 * Middleware to require minimum role level (hierarchical)
 * Usage: requireMinRole('CLIENT') - allows CLIENT and ADMIN
 */
export const requireMinRole = (minRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
      return;
    }

    const userRole = req.user.role;

    if (!hasRole(userRole, minRole)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Minimum required role: ${minRole}. Your role: ${userRole}`,
        requiredMinRole: minRole,
        userRole
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require admin role
 * Convenience wrapper for requireRole(UserRole.ADMIN)
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware to require client role or higher
 * Convenience wrapper for requireMinRole(UserRole.CLIENT)
 */
export const requireClient = requireMinRole(UserRole.CLIENT);

/**
 * Middleware to require investor role or higher (essentially any authenticated user)
 * Convenience wrapper for requireMinRole(UserRole.INVESTOR)
 */
export const requireInvestor = requireMinRole(UserRole.INVESTOR);

/**
 * Check if current user can access resource owned by specific user
 * Useful for user-specific resources
 */
export const canAccessUserResource = (
  req: AuthenticatedRequest,
  resourceOwnerId: string
): boolean => {
  if (!req.user) {
    return false;
  }

  // User can access their own resources
  if (req.user.id === resourceOwnerId) {
    return true;
  }

  // Admins can access any user's resources
  if (req.user.role === UserRole.ADMIN) {
    return true;
  }

  return false;
};

/**
 * Middleware to require resource ownership or admin role
 * Usage: requireOwnershipOrAdmin('userId') where userId is from route params
 */
export const requireOwnershipOrAdmin = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
      return;
    }

    const resourceOwnerId = req.params[userIdParam];

    if (!resourceOwnerId) {
      res.status(400).json({
        error: 'Invalid request',
        message: `Missing ${userIdParam} parameter`
      });
      return;
    }

    if (!canAccessUserResource(req, resourceOwnerId)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources unless you are an admin'
      });
      return;
    }

    next();
  };
};

/**
 * Get user role from request
 * Utility function for controllers
 */
export const getUserRole = (req: AuthenticatedRequest): UserRole | null => {
  return req.user?.role || null;
};

/**
 * Check if current user is admin
 * Utility function for controllers
 */
export const isAdmin = (req: AuthenticatedRequest): boolean => {
  return req.user?.role === UserRole.ADMIN;
};

/**
 * Check if current user is client or higher
 * Utility function for controllers
 */
export const isClientOrHigher = (req: AuthenticatedRequest): boolean => {
  return req.user ? hasRole(req.user.role, UserRole.CLIENT) : false;
};