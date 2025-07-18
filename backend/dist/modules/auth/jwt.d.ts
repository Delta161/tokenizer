import { Request, Response } from 'express';
/**
 * JWT payload interface
 */
export interface JWTPayload {
    id: string;
    email: string;
    provider: string;
    role: 'INVESTOR' | 'CLIENT' | 'ADMIN';
    iat?: number;
    exp?: number;
}
/**
 * Refresh token payload interface
 */
export interface RefreshTokenPayload {
    userId: string;
    type: 'refresh';
    iat?: number;
    exp?: number;
}
/**
 * Extended Request interface with user data
 */
export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}
/**
 * Generate access token
 */
export declare const generateAccessToken: (payload: Omit<JWTPayload, "iat" | "exp">) => string;
/**
 * Generate refresh token
 */
export declare const generateRefreshToken: (userId: string) => string;
/**
 * Verify and decode JWT token
 */
export declare const verifyToken: (token: string) => JWTPayload;
/**
 * Extract token from request (cookie or Authorization header)
 */
export declare const extractTokenFromRequest: (req: Request) => string | null;
/**
 * Set JWT tokens in HTTP-only cookies
 */
export declare const setTokenCookies: (res: Response, accessToken: string, refreshToken: string) => void;
/**
 * Clear JWT cookies
 */
export declare const clearTokenCookies: (res: Response) => void;
//# sourceMappingURL=jwt.d.ts.map