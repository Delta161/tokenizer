import * as jwt from 'jsonwebtoken';
/**
 * JWT configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
/**
 * Generate access token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'tokenizer-platform',
        audience: 'tokenizer-users'
    });
};
/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'tokenizer-platform',
        audience: 'tokenizer-users'
    });
};
/**
 * Verify and decode JWT token
 */
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'tokenizer-platform',
            audience: 'tokenizer-users'
        });
        return decoded;
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw new Error('Token verification failed');
    }
};
/**
 * Extract token from request (cookie or Authorization header)
 */
export const extractTokenFromRequest = (req) => {
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    // Check HTTP-only cookie
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }
    return null;
};
/**
 * Set JWT tokens in HTTP-only cookies
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
    // Set access token cookie (7 days)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
    // Set refresh token cookie (30 days)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    });
};
/**
 * Clear JWT cookies
 */
export const clearTokenCookies = (res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};
//# sourceMappingURL=jwt.js.map