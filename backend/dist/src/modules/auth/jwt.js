/**
 * JWT Utilities
 * Handles JWT token generation, verification, and cookie management
 */
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';
// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';
// Token expiration times
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
/**
 * Generate access token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });
};
/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};
/**
 * Verify access token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error('Token verification failed', { error: error.message });
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
        }
        throw new Error('Invalid token');
    }
};
/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        // Ensure it's a refresh token
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error('Refresh token verification failed', { error: error.message });
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            }
        }
        throw new Error('Invalid refresh token');
    }
};
/**
 * Extract token from request
 * Checks Authorization header and cookies
 */
export const extractTokenFromRequest = (req) => {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    // Check cookies
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }
    return null;
};
/**
 * Extract refresh token from request
 * Checks cookies and request body
 */
export const extractRefreshTokenFromRequest = (req) => {
    // Check cookies
    if (req.cookies && req.cookies.refreshToken) {
        return req.cookies.refreshToken;
    }
    // Check request body
    if (req.body && req.body.refreshToken) {
        return req.body.refreshToken;
    }
    return null;
};
/**
 * Set token cookies
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
    // Set access token cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 // 1 hour
    });
    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/v1/auth/refresh', // Only sent to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};
/**
 * Clear token cookies
 */
export const clearTokenCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
};
//# sourceMappingURL=jwt.js.map