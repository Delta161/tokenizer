import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
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
export declare const requireAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional authentication middleware
 * Similar to requireAuth but doesn't fail if no token is provided
 * Useful for routes that have different behavior for authenticated vs anonymous users
 */
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if user is authenticated (simpler version)
 * Returns boolean instead of throwing errors
 */
export declare const isAuthenticated: (req: AuthenticatedRequest) => boolean;
/**
 * Get current user from request
 * Useful utility function for controllers
 */
export declare const getCurrentUser: (req: AuthenticatedRequest) => {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    role: import(".prisma/client").$Enums.UserRole;
    email: string;
    fullName: string;
    providerId: string;
    avatarUrl: string | null;
    deletedAt: Date | null;
    phone: string | null;
    preferredLanguage: string | null;
    timezone: string | null;
    authProvider: import(".prisma/client").$Enums.AuthProvider;
} | null;
//# sourceMappingURL=requireAuth.d.ts.map