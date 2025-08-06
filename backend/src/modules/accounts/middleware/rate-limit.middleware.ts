/**
 * Rate Limiting Middleware for Accounts Module
 * Implements intelligent rate limiting with different rules for different endpoints
 */

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { accountsLogger } from '../utils/accounts.logger';

/**
 * Create rate limiter with memory store
 */
function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}) {
  return rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      accountsLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        userId: (req as any).user?.id
      });
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  });
}

/**
 * Rate limiter for authentication endpoints (stricter)
 * 10 requests per 15 minutes per IP
 */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: true
});

/**
 * Rate limiter for profile operations (moderate)
 * 100 requests per 15 minutes per IP
 */
export const profileRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many profile requests. Please try again later.'
});

/**
 * Rate limiter for admin operations (strict)
 * 50 requests per 15 minutes per IP
 */
export const adminRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many admin requests. Please try again later.'
});

/**
 * Rate limiter for general user operations (lenient)
 * 200 requests per 15 minutes per IP
 */
export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests. Please try again later.'
});

/**
 * Dynamic rate limiter that applies different limits based on user role
 */
export const dynamicRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // Apply different limits based on user role
  if (user?.role === 'ADMIN') {
    // Admins get higher limits
    return createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: 'Admin rate limit exceeded. Please try again later.'
    })(req, res, next);
  } else if (user?.role === 'CLIENT') {
    // Clients get moderate limits
    return createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: 'Client rate limit exceeded. Please try again later.'
    })(req, res, next);
  } else {
    // Default/investor limits
    return generalRateLimit(req, res, next);
  }
};

/**
 * Health check for rate limiting system
 */
export const checkRateLimitHealth = async (): Promise<boolean> => {
  // Since we're using memory store, always return true
  // In production, this would check Redis connectivity
  return true;
};
