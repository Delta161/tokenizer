/**
 * Advanced Input Validation & Sanitization Utilities
 * Provides comprehensive validation and sanitization for all account inputs
 */

import { z } from 'zod';
import validator from 'validator';
import DOMPurify from 'dompurify';
import { AuthProvider, UserRole } from '@prisma/client';

/**
 * Security-focused validation patterns
 */
export const SECURITY_PATTERNS = {
  // Prevent SQL injection patterns
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|WHERE|FROM)\b)|(\b\d+\s*=\s*\d+\b)|(-{2,})|(\*\/|\*\s*from)|(\bEXEC\b)|(\bEXECUTE\b)|(\bSHUTDOWN\b)/i,
  
  // Prevent XSS patterns
  XSS_PATTERNS: /<\s*script[^>]*>.*?<\s*\/\s*script\s*>|<\s*iframe[^>]*>.*?<\s*\/\s*iframe\s*>|javascript:|vbscript:|data:text\/html|on\w+\s*=|<\s*object[^>]*>|<\s*embed[^>]*>/i,
  
  // Prevent path traversal
  PATH_TRAVERSAL: /(\.\.[\/\\])|(\.[\/\\])|([\/\\]\.\.)|(^[\/\\])|(\~[\/\\])|(\%2e\%2e)|(\%2f)|(\%5c)/i,
  
  // Safe filename pattern
  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,
  
  // Strong password requirements
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Safe HTML tags
  ALLOWED_HTML_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  
  // Common attack patterns
  COMMON_ATTACKS: /(\bunion\b.*\bselect\b)|(\bor\b.*1\s*=\s*1)|(\bdrop\b.*\btable\b)|(\binsert\b.*\binto\b)|(\bupdate\b.*\bset\b)|(\bdelete\b.*\bfrom\b)/i
};

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize and validate email input
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email format');
    }

    // Remove whitespace and convert to lowercase
    const cleaned = email.trim().toLowerCase();
    
    // Validate email format
    if (!validator.isEmail(cleaned)) {
      throw new Error('Invalid email format');
    }
    
    // Check for potential attacks
    if (SECURITY_PATTERNS.SQL_INJECTION.test(cleaned) || 
        SECURITY_PATTERNS.XSS_PATTERNS.test(cleaned)) {
      throw new Error('Invalid characters in email');
    }
    
    return cleaned;
  }

  /**
   * Sanitize user full name
   */
  static sanitizeFullName(name: string): string {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid name format');
    }

    // Remove potentially dangerous characters
    let cleaned = name.trim();
    
    // Check for attacks
    if (SECURITY_PATTERNS.SQL_INJECTION.test(cleaned) || 
        SECURITY_PATTERNS.XSS_PATTERNS.test(cleaned)) {
      throw new Error('Invalid characters in name');
    }
    
    // Sanitize HTML
    cleaned = DOMPurify.sanitize(cleaned, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
    
    // Validate length and characters
    if (cleaned.length < 1 || cleaned.length > 100) {
      throw new Error('Name must be between 1 and 100 characters');
    }
    
    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s'-]+$/.test(cleaned)) {
      throw new Error('Name contains invalid characters');
    }
    
    return cleaned;
  }

  /**
   * Sanitize profile bio/description
   */
  static sanitizeBio(bio: string): string {
    if (!bio || typeof bio !== 'string') {
      return '';
    }

    let cleaned = bio.trim();
    
    // Check for attacks
    if (SECURITY_PATTERNS.SQL_INJECTION.test(cleaned) || 
        SECURITY_PATTERNS.XSS_PATTERNS.test(cleaned) ||
        SECURITY_PATTERNS.COMMON_ATTACKS.test(cleaned)) {
      throw new Error('Bio contains prohibited content');
    }
    
    // Sanitize HTML - allow basic formatting
    cleaned = DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: SECURITY_PATTERNS.ALLOWED_HTML_TAGS,
      ALLOWED_ATTR: [],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'style']
    });
    
    // Validate length
    if (cleaned.length > 500) {
      throw new Error('Bio must not exceed 500 characters');
    }
    
    return cleaned;
  }

  /**
   * Sanitize file upload names
   */
  static sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid filename');
    }

    const cleaned = fileName.trim();
    
    // Check for path traversal attacks
    if (SECURITY_PATTERNS.PATH_TRAVERSAL.test(cleaned)) {
      throw new Error('Invalid filename - path traversal detected');
    }
    
    // Validate against safe filename pattern
    if (!SECURITY_PATTERNS.SAFE_FILENAME.test(cleaned)) {
      throw new Error('Filename contains invalid characters');
    }
    
    // Validate length
    if (cleaned.length > 255) {
      throw new Error('Filename too long');
    }
    
    return cleaned;
  }

  /**
   * Validate and sanitize URL inputs
   */
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL');
    }

    const cleaned = url.trim();
    
    // Validate URL format
    if (!validator.isURL(cleaned, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })) {
      throw new Error('Invalid URL format');
    }
    
    // Check for suspicious patterns
    if (SECURITY_PATTERNS.XSS_PATTERNS.test(cleaned)) {
      throw new Error('URL contains prohibited content');
    }
    
    return cleaned;
  }
}

/**
 * Enhanced validation schemas with security focus
 */
export const SecurityValidationSchemas = {
  /**
   * Secure email validation
   */
  email: z.string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .transform((val) => InputSanitizer.sanitizeEmail(val))
    .refine((val) => validator.isEmail(val), 'Invalid email format'),

  /**
   * Secure full name validation
   */
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Name too long')
    .transform((val) => InputSanitizer.sanitizeFullName(val))
    .refine((val) => !/\d/.test(val), 'Name cannot contain numbers'),

  /**
   * Secure bio validation
   */
  bio: z.string()
    .optional()
    .transform((val) => val ? InputSanitizer.sanitizeBio(val) : ''),

  /**
   * Provider ID validation
   */
  providerId: z.string()
    .min(1, 'Provider ID is required')
    .max(255, 'Provider ID too long')
    .refine((val) => {
      // Check for injection attempts
      return !SECURITY_PATTERNS.SQL_INJECTION.test(val) && 
             !SECURITY_PATTERNS.XSS_PATTERNS.test(val);
    }, 'Invalid provider ID format'),

  /**
   * Auth provider validation
   */
  authProvider: z.nativeEnum(AuthProvider, {
    message: 'Invalid authentication provider'
  }),

  /**
   * User role validation
   */
  userRole: z.nativeEnum(UserRole, {
    message: 'Invalid user role'
  }),

  /**
   * Avatar URL validation
   */
  avatarUrl: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      try {
        InputSanitizer.sanitizeUrl(val);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid avatar URL'),

  /**
   * File upload validation
   */
  fileName: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .transform((val) => InputSanitizer.sanitizeFileName(val)),

  /**
   * Search query validation
   */
  searchQuery: z.string()
    .max(100, 'Search query too long')
    .refine((val) => {
      return !SECURITY_PATTERNS.SQL_INJECTION.test(val) && 
             !SECURITY_PATTERNS.XSS_PATTERNS.test(val) &&
             !SECURITY_PATTERNS.COMMON_ATTACKS.test(val);
    }, 'Invalid search query'),

  /**
   * Pagination validation with security limits
   */
  pagination: z.object({
    page: z.number().int().min(1).max(10000).default(1),
    limit: z.number().int().min(1).max(100).default(20), // Prevent excessive data exposure
    sortBy: z.string().optional().refine((val) => {
      if (!val) return true;
      // Only allow predefined sort fields
      const allowedFields = ['createdAt', 'updatedAt', 'email', 'fullName'];
      return allowedFields.includes(val);
    }, 'Invalid sort field'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  /**
   * IP address validation
   */
  ipAddress: z.string()
    .refine((val) => validator.isIP(val), 'Invalid IP address'),

  /**
   * User agent validation
   */
  userAgent: z.string()
    .max(500, 'User agent string too long')
    .refine((val) => {
      return !SECURITY_PATTERNS.SQL_INJECTION.test(val) && 
             !SECURITY_PATTERNS.XSS_PATTERNS.test(val);
    }, 'Invalid user agent')
};

/**
 * Request validation middleware factory
 */
export function createSecureValidator<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        });
      }
      
      // Replace request body with validated and sanitized data
      req.body = validationResult.data;
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error instanceof Error ? error.message : 'Invalid input'
      });
    }
  };
}

/**
 * Security headers middleware
 */
export const securityHeaders = (req: any, res: any, next: any) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy for API responses
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  
  next();
};
