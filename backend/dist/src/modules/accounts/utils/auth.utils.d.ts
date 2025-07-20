/**
 * Auth Utilities
 * Helper functions for authentication-related operations
 */
import { Request } from 'express';
import type { UserRole } from '@modules/accounts/types/auth.types';
/**
 * Check if a user has the required role
 * @param userRole The user's role
 * @param requiredRole The required role
 * @returns True if the user has the required role, false otherwise
 */
export declare const hasRole: (userRole: UserRole, requiredRole: UserRole) => boolean;
/**
 * Get client IP address from request
 * @param req Express request object
 * @returns Client IP address
 */
export declare const getClientIp: (req: Request) => string;
/**
 * Get user agent from request
 * @param req Express request object
 * @returns User agent string
 */
export declare const getUserAgent: (req: Request) => string;
//# sourceMappingURL=auth.utils.d.ts.map