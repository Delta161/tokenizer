/**
 * Enhanced Security-Focused Validators for Accounts Module
 * Replaces and enhances existing validators with security-first approach
 */

import { z } from 'zod';
import { SecurityValidationSchemas, SECURITY_PATTERNS } from '../utils/security-validation.util';
import { AuthProvider, UserRole } from '@prisma/client';

/**
 * User Registration Validation (Enhanced)
 */
export const SecureRegistrationSchema = z.object({
  email: SecurityValidationSchemas.email,
  fullName: SecurityValidationSchemas.fullName,
  providerId: SecurityValidationSchemas.providerId,
  authProvider: SecurityValidationSchemas.authProvider,
  avatarUrl: SecurityValidationSchemas.avatarUrl,
  
  // Additional security fields
  ipAddress: z.string().optional(),
  userAgent: SecurityValidationSchemas.userAgent.optional(),
  
  // Consent and terms
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted')
});

/**
 * Profile Update Validation (Enhanced)
 */
export const SecureProfileUpdateSchema = z.object({
  fullName: SecurityValidationSchemas.fullName.optional(),
  bio: SecurityValidationSchemas.bio,
  avatarUrl: SecurityValidationSchemas.avatarUrl,
  
  // Security tracking
  lastModifiedBy: z.string().uuid('Invalid user ID').optional(),
  changeReason: z.string()
    .max(200, 'Change reason too long')
    .optional()
    .refine((val) => {
      if (!val) return true;
      return !SECURITY_PATTERNS.SQL_INJECTION.test(val) && 
             !SECURITY_PATTERNS.XSS_PATTERNS.test(val);
    }, 'Invalid characters in change reason')
}).refine((data) => {
  // At least one field must be provided for update
  return Object.values(data).some(value => value !== undefined && value !== null && value !== '');
}, 'At least one field must be provided for update');

/**
 * User Search Validation (Enhanced)
 */
export const SecureUserSearchSchema = z.object({
  query: SecurityValidationSchemas.searchQuery.optional(),
  filters: z.object({
    role: SecurityValidationSchemas.userRole.optional(),
    authProvider: SecurityValidationSchemas.authProvider.optional(),
    isActive: z.boolean().optional(),
    createdAfter: z.string().datetime().optional(),
    createdBefore: z.string().datetime().optional()
  }).optional(),
  pagination: SecurityValidationSchemas.pagination,
  
  // Security context
  requesterId: z.string().uuid('Invalid requester ID'),
  accessLevel: z.enum(['basic', 'detailed', 'admin']).default('basic')
});

/**
 * Admin User Management Validation (Enhanced)
 */
export const SecureAdminUserUpdateSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
  updates: z.object({
    fullName: SecurityValidationSchemas.fullName.optional(),
    role: SecurityValidationSchemas.userRole.optional(),
    isActive: z.boolean().optional(),
    bio: SecurityValidationSchemas.bio
  }),
  
  // Admin security tracking
  adminId: z.string().uuid('Invalid admin ID'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason too long')
    .refine((val) => {
      return !SECURITY_PATTERNS.SQL_INJECTION.test(val) && 
             !SECURITY_PATTERNS.XSS_PATTERNS.test(val);
    }, 'Invalid characters in reason'),
  notifyUser: z.boolean().default(false)
});

/**
 * File Upload Validation (Enhanced)
 */
export const SecureFileUploadSchema = z.object({
  fileName: SecurityValidationSchemas.fileName,
  fileSize: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB max
  mimeType: z.string().refine((val) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ];
    return allowedTypes.includes(val);
  }, 'File type not allowed'),
  
  // Security metadata
  uploadedBy: z.string().uuid('Invalid user ID'),
  purpose: z.enum(['avatar', 'document', 'verification']),
  
  // Virus scan results (if available)
  scanStatus: z.enum(['pending', 'clean', 'infected', 'error']).default('pending'),
  scanDetails: z.string().optional()
});

/**
 * Authentication Attempt Validation (Enhanced)
 */
export const SecureAuthAttemptSchema = z.object({
  email: SecurityValidationSchemas.email,
  authProvider: SecurityValidationSchemas.authProvider,
  providerId: SecurityValidationSchemas.providerId,
  
  // Security context
  ipAddress: SecurityValidationSchemas.ipAddress,
  userAgent: SecurityValidationSchemas.userAgent,
  
  // Device fingerprinting
  deviceId: z.string()
    .min(1, 'Device ID required')
    .max(255, 'Device ID too long')
    .optional(),
  
  // Behavioral analysis
  mouseMovements: z.number().optional(),
  keystrokeDynamics: z.string().optional(),
  screenResolution: z.string().optional(),
  timezone: z.string().optional()
});

/**
 * Security Event Logging Schema
 */
export const SecurityEventSchema = z.object({
  eventType: z.enum([
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'PASSWORD_CHANGE',
    'PROFILE_UPDATE',
    'ROLE_CHANGE',
    'ACCOUNT_LOCK',
    'ACCOUNT_UNLOCK',
    'SUSPICIOUS_ACTIVITY',
    'PERMISSION_DENIED',
    'DATA_ACCESS',
    'ADMIN_ACTION'
  ]),
  
  userId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(), // Who performed the action
  targetId: z.string().uuid().optional(), // Who was affected
  
  // Context
  ipAddress: SecurityValidationSchemas.ipAddress,
  userAgent: SecurityValidationSchemas.userAgent,
  endpoint: z.string().max(255),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  
  // Metadata
  details: z.record(z.string(), z.any()).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  
  // Compliance
  requiresReview: z.boolean().default(false),
  dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).optional()
});

/**
 * Rate Limit Configuration Schema
 */
export const RateLimitConfigSchema = z.object({
  identifier: z.string().min(1, 'Identifier required'),
  windowMs: z.number().int().min(1000).max(3600000), // 1 second to 1 hour
  maxRequests: z.number().int().min(1).max(10000),
  
  // Dynamic adjustments
  userRole: SecurityValidationSchemas.userRole.optional(),
  endpoint: z.string().optional(),
  
  // Security enhancements
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
  keyGenerator: z.string().optional(),
  
  // Response configuration
  message: z.string().max(200).optional(),
  standardHeaders: z.boolean().default(true),
  legacyHeaders: z.boolean().default(false)
});

/**
 * Data Access Audit Schema
 */
export const DataAccessAuditSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  resourceType: z.enum(['USER_PROFILE', 'ADMIN_DATA', 'SYSTEM_LOGS', 'ANALYTICS', 'REPORTS']),
  resourceId: z.string().optional(),
  
  // Access details
  accessType: z.enum(['READ', 'WRITE', 'DELETE', 'EXPORT', 'SEARCH']),
  fieldsAccessed: z.array(z.string()).optional(),
  
  // Query/filter context
  queryParams: z.record(z.string(), z.any()).optional(),
  resultCount: z.number().int().min(0).optional(),
  
  // Security context
  ipAddress: SecurityValidationSchemas.ipAddress,
  userAgent: SecurityValidationSchemas.userAgent,
  sessionId: z.string().optional(),
  
  // Compliance
  legalBasis: z.enum(['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS']).optional(),
  dataRetentionPeriod: z.number().int().optional() // Days
});

/**
 * Input validation with comprehensive error handling
 */
export function validateWithSecurity<T>(
  schema: z.ZodSchema<T>, 
  data: unknown,
  context?: { userId?: string; ipAddress?: string; userAgent?: string }
): { success: true; data: T } | { success: false; errors: string[]; securityIssues: string[] } {
  
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: string[] = [];
  const securityIssues: string[] = [];
  
  result.error.issues.forEach(issue => {
    const errorMessage = `${issue.path.join('.')}: ${issue.message}`;
    errors.push(errorMessage);
    
    // Check for potential security issues
    if (issue.message.includes('Invalid characters') ||
        issue.message.includes('prohibited content') ||
        issue.message.includes('path traversal') ||
        issue.message.includes('injection')) {
      securityIssues.push(`Security violation: ${errorMessage}`);
      
      // Log security issue if context provided
      if (context) {
        console.warn('Security validation failure:', {
          ...context,
          issue: errorMessage,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
  
  return { success: false, errors, securityIssues };
}

/**
 * Export enhanced validation schemas
 */
export const EnhancedValidators = {
  registration: SecureRegistrationSchema,
  profileUpdate: SecureProfileUpdateSchema,
  userSearch: SecureUserSearchSchema,
  adminUserUpdate: SecureAdminUserUpdateSchema,
  fileUpload: SecureFileUploadSchema,
  authAttempt: SecureAuthAttemptSchema,
  securityEvent: SecurityEventSchema,
  rateLimitConfig: RateLimitConfigSchema,
  dataAccessAudit: DataAccessAuditSchema
};

export type RegistrationInput = z.infer<typeof SecureRegistrationSchema>;
export type ProfileUpdateInput = z.infer<typeof SecureProfileUpdateSchema>;
export type UserSearchInput = z.infer<typeof SecureUserSearchSchema>;
export type AdminUserUpdateInput = z.infer<typeof SecureAdminUserUpdateSchema>;
export type FileUploadInput = z.infer<typeof SecureFileUploadSchema>;
export type AuthAttemptInput = z.infer<typeof SecureAuthAttemptSchema>;
export type SecurityEventInput = z.infer<typeof SecurityEventSchema>;
export type RateLimitConfigInput = z.infer<typeof RateLimitConfigSchema>;
export type DataAccessAuditInput = z.infer<typeof DataAccessAuditSchema>;
