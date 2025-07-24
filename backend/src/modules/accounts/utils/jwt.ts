/**
 * JWT Utilities
 * Handles JWT token generation, verification, and cookie management
 */

// External packages
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Internal modules
import type { UserRole } from '@modules/accounts/types/auth.types';
import { logger } from '@utils/logger';

// JWT secret getters with validation
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be defined in environment variables');
  }
  return secret;
};

const getJWTRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET must be defined in environment variables');
  }
  return secret;
};

// Token expiration times
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

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
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' } as RefreshTokenPayload,
    getJWTRefreshSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Verify access token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload;
  } catch (error) {
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
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, getJWTRefreshSecret()) as RefreshTokenPayload;
    
    // Ensure it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
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
export const extractTokenFromRequest = (req: Request): string | null => {
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
export const extractRefreshTokenFromRequest = (req: Request): string | null => {
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
export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
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
    path: process.env.API_AUTH_REFRESH_PATH || '/api/v1/auth/refresh', // Only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Clear token cookies
 */
export const clearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: process.env.API_AUTH_REFRESH_PATH || '/api/v1/auth/refresh' });
};

