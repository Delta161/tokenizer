/**
 * JWT Utilities
 * Handles JWT token generation, verification, and cookie management
 */
import { Request, Response } from 'express';
import { UserRole } from './auth.types';
/**
 * JWT payload interface
 */
export interface JWTPayload {
    id: string;
    email: string;
    role: UserRole;
    provider?: string;
}
/**
 * Refresh token payload interface
 */
export interface RefreshTokenPayload {
    userId: string;
    type: 'refresh';
    exp?: number;
}
/**
 * Generate access token
 */
export declare const generateAccessToken: (payload: JWTPayload) => string;
/**
 * Generate refresh token
 */
export declare const generateRefreshToken: (userId: string) => string;
/**
 * Verify access token
 */
export declare const verifyToken: (token: string) => JWTPayload;
/**
 * Verify refresh token
 */
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
/**
 * Extract token from request
 * Checks Authorization header and cookies
 */
export declare const extractTokenFromRequest: (req: Request) => string | null;
/**
 * Extract refresh token from request
 * Checks cookies and request body
 */
export declare const extractRefreshTokenFromRequest: (req: Request) => string | null;
/**
 * Set token cookies
 */
export declare const setTokenCookies: (res: Response, accessToken: string, refreshToken: string) => void;
/**
 * Clear token cookies
 */
export declare const clearTokenCookies: (res: Response) => void;
//# sourceMappingURL=jwt.d.ts.map