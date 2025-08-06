import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { InputSanitizer } from '../utils/security-validation.util';
import { logger } from '../../../utils/logger';

/**
 * Enhanced security middleware for the accounts module
 * Integrates with existing rate limiting, monitoring, and audit systems
 */

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP for accounts module (adjust based on your needs)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'");

  next();
};

// Input sanitization middleware
export const sanitizeInput = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Sanitize common input fields
    if (req.body) {
      if (req.body.email) {
        req.body.email = InputSanitizer.sanitizeEmail(req.body.email);
      }
      if (req.body.fullName) {
        req.body.fullName = InputSanitizer.sanitizeFullName(req.body.fullName);
      }
      if (req.body.bio) {
        req.body.bio = InputSanitizer.sanitizeBio(req.body.bio);
      }
      if (req.body.fileName) {
        req.body.fileName = InputSanitizer.sanitizeFileName(req.body.fileName);
      }
      if (req.body.url) {
        req.body.url = InputSanitizer.sanitizeUrl(req.body.url);
      }
    }

    next();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Input sanitization failed';
    logger.error(errorMsg, { context: 'SecurityMiddleware:SanitizeInput', path: req.path });

    res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      error: errorMsg
    });
  }
};

// Enhanced rate limiting for sensitive operations
export const sensitiveOperationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 attempts per window
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return `${req.ip}-${req.user?.id || 'anonymous'}`;
  },
  skip: (req: Request) => {
    // Skip rate limiting for admin users in development
    return process.env.NODE_ENV === 'development' && req.user?.role === 'admin';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      context: 'SecurityMiddleware:RateLimit',
      ip: req.ip,
      path: req.path,
      userId: req.user?.id
    });

    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again later.',
      error: 'Rate limit exceeded'
    });
  }
});

// Authentication audit middleware - simplified version
export const auditAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    // Check if this was an authentication attempt
    if (req.path.includes('/login') || req.path.includes('/register') || req.path.includes('/auth')) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      const email = req.body?.email || req.query?.email;

      // Log authentication attempt
      if (success) {
        logger.info('Authentication successful', {
          context: 'SecurityMiddleware:Auth',
          email: email,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          provider: req.body?.provider || req.query?.provider || 'email'
        });
      } else {
        logger.warn('Authentication failed', {
          context: 'SecurityMiddleware:Auth',
          email: email,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          statusCode: res.statusCode
        });
      }
    }
    
    return originalSend.call(this, body);
  };

  next();
};

// Session security validation middleware - simplified
export const validateSessionSecurity = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session || !req.user) {
    return next();
  }

  try {
    // Check session age (force re-auth after 24 hours)
    if (req.session.cookie && req.session.cookie.maxAge) {
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (req.session.cookie.maxAge > maxAge) {
        logger.info('Session expired - forcing re-authentication', {
          context: 'SecurityMiddleware:SessionValidation',
          userId: req.user.id,
          ip: req.ip
        });

        req.session.destroy((err) => {
          if (err) {
            logger.error('Session destruction failed', { context: 'SecurityMiddleware', error: err.message });
          }
          res.status(401).json({
            success: false,
            message: 'Session expired. Please log in again.',
            error: 'SESSION_EXPIRED'
          });
        });
        return;
      }
    }

    next();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Session validation failed';
    logger.error(errorMsg, { context: 'SecurityMiddleware:SessionValidation' });
    next(); // Continue on error, don't block legitimate requests
  }
};

export default {
  securityHeaders,
  sanitizeInput,
  auditAuthentication,
  sensitiveOperationLimit,
  validateSessionSecurity
};
