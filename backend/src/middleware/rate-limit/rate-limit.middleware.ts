/**
 * Rate Limiting Middleware
 * 
 * This file contains rate limiting middleware configurations for different
 * API endpoints to prevent abuse and enhance security.
 */

import { rateLimit } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

// Base rate limit configuration
const baseConfig = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests against the rate limit
  // Called when a request hits the rate limit
  handler: (req: Request, res: Response, _next: NextFunction): void => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      headers: req.headers
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Authentication endpoints rate limiter (stricter)
 * 
 * Applied to login, registration, and password recovery endpoints
 * to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  }
});

/**
 * OAuth initiation endpoints rate limiter
 * 
 * Applied to OAuth provider redirect endpoints
 */
export const oauthLimiter = rateLimit({
  ...baseConfig,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 requests per IP per 10 minutes
  message: {
    success: false,
    error: 'Too many OAuth redirect attempts, please try again later',
    code: 'OAUTH_RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  }
});

/**
 * General API endpoints rate limiter
 * 
 * Applied to standard API endpoints
 */
export const apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per IP per minute (1 request per second)
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'API_RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  }
});

/**
 * User management endpoints rate limiter
 * 
 * Applied to profile update, user retrieval endpoints
 */
export const userLimiter = rateLimit({
  ...baseConfig,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per IP per 5 minutes
  message: {
    success: false,
    error: 'Too many user operations, please try again later',
    code: 'USER_RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  }
});

/**
 * KYC verification endpoints rate limiter
 * 
 * Applied to KYC document submission and verification endpoints
 */
export const kycLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per IP per hour
  message: {
    success: false,
    error: 'Too many KYC verification attempts, please try again later',
    code: 'KYC_RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  }
});
