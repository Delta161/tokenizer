import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

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
 * JWT configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Generate access token
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'tokenizer-platform',
    audience: 'tokenizer-users'
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'tokenizer-platform',
      audience: 'tokenizer-users'
    } as jwt.SignOptions
  );
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'tokenizer-platform',
      audience: 'tokenizer-users'
    } as jwt.VerifyOptions) as JWTPayload;
    
    return decoded;
  } catch (error: any) {
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
export const extractTokenFromRequest = (req: Request): string | null => {
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
export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string): void => {
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
export const clearTokenCookies = (res: Response): void => {
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