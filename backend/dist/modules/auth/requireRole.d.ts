import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from './requireAuth.js';
/**
 * Check if a user has a specific role or higher
 */
export declare const hasRole: (userRole: UserRole, requiredRole: UserRole) => boolean;
/**
 * Check if a user has any of the specified roles
 */
export declare const hasAnyRole: (userRole: UserRole, allowedRoles: UserRole[]) => boolean;
/**
 * Middleware factory to require specific role(s)
 * Usage: requireRole('ADMIN') or requireRole(['CLIENT', 'ADMIN'])
 */
export declare const requireRole: (allowedRoles: UserRole | UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to require minimum role level (hierarchical)
 * Usage: requireMinRole('CLIENT') - allows CLIENT and ADMIN
 */
export declare const requireMinRole: (minRole: UserRole) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to require admin role
 * Convenience wrapper for requireRole(UserRole.ADMIN)
 */
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to require client role or higher
 * Convenience wrapper for requireMinRole(UserRole.CLIENT)
 */
export declare const requireClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to require investor role or higher (essentially any authenticated user)
 * Convenience wrapper for requireMinRole(UserRole.INVESTOR)
 */
export declare const requireInvestor: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Check if current user can access resource owned by specific user
 * Useful for user-specific resources
 */
export declare const canAccessUserResource: (req: AuthenticatedRequest, resourceOwnerId: string) => boolean;
/**
 * Middleware to require resource ownership or admin role
 * Usage: requireOwnershipOrAdmin('userId') where userId is from route params
 */
export declare const requireOwnershipOrAdmin: (userIdParam?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Get user role from request
 * Utility function for controllers
 */
export declare const getUserRole: (req: AuthenticatedRequest) => UserRole | null;
/**
 * Check if current user is admin
 * Utility function for controllers
 */
export declare const isAdmin: (req: AuthenticatedRequest) => boolean;
/**
 * Check if current user is client or higher
 * Utility function for controllers
 */
export declare const isClientOrHigher: (req: AuthenticatedRequest) => boolean;
//# sourceMappingURL=requireRole.d.ts.map