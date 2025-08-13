/**
 * User Module Validators
 * Contains Zod schemas for validating user-related requests
 */

// External packages
import { z } from 'zod';

// Internal modules
import { UserRole } from '../types/auth.types';
import { AuthProvider } from '@prisma/client';

// Common validation constants
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 100;
const MAX_BIO_LENGTH = 500;
const PHONE_REGEX = /^\+[1-9]\d{1,14}$/; // E.164 format
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/; // ISO 3166-1 alpha-2

/**
 * Create user schema
 * Note: All authentication is handled through OAuth providers only
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(MIN_NAME_LENGTH, 'Full name is required').max(MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`),
  providerId: z.string().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
  role: z.nativeEnum(UserRole).optional().default('INVESTOR'),
  phone: z.string().regex(PHONE_REGEX, 'Phone number must be in E.164 format (e.g., +12345678901)').optional(),
  preferredLanguage: z.string().length(2, 'Language code must be ISO 639-1 format (2 characters)').optional(),
  timezone: z.string().optional(),
  authProvider: z.nativeEnum(AuthProvider),
  bio: z.string().max(MAX_BIO_LENGTH, `Bio cannot exceed ${MAX_BIO_LENGTH} characters`).optional(),
  country: z.string().regex(COUNTRY_CODE_REGEX, 'Country must be a valid ISO 3166-1 alpha-2 code').optional(),
  isMarketingOptIn: z.boolean().optional()
}).refine(
  // If providerId is present, authProvider must also be present
  data => !(data.providerId && !data.authProvider),
  {
    message: 'Auth provider is required when provider ID is present',
    path: ['authProvider']
  }
);

/**
 * Create user from OAuth profile schema
 */
export const createUserFromOAuthSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(MIN_NAME_LENGTH, 'Full name is required').max(MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`),
  providerId: z.string().min(1, 'Provider ID is required'),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
  role: z.nativeEnum(UserRole).optional().default('INVESTOR'),
  authProvider: z.nativeEnum(AuthProvider),
  bio: z.string().max(MAX_BIO_LENGTH, `Bio cannot exceed ${MAX_BIO_LENGTH} characters`).optional(),
  country: z.string().regex(COUNTRY_CODE_REGEX, 'Country must be a valid ISO 3166-1 alpha-2 code').optional()
}).strict();

/**
 * Update user schema
 */
export const updateUserSchema = z.object({
  fullName: z.string().min(MIN_NAME_LENGTH, 'Full name is required').max(MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`).optional(),
  email: z.string().email('Invalid email format').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
  phone: z.string().regex(PHONE_REGEX, 'Phone number must be in E.164 format (e.g., +12345678901)').optional(),
  preferredLanguage: z.string().length(2, 'Language code must be ISO 639-1 format (2 characters)').optional(),
  role: z.nativeEnum(UserRole).optional(),
  timezone: z.string().optional(),
  bio: z.string().max(MAX_BIO_LENGTH, `Bio cannot exceed ${MAX_BIO_LENGTH} characters`).optional(),
  country: z.string().regex(COUNTRY_CODE_REGEX, 'Country must be a valid ISO 3166-1 alpha-2 code').optional(),
  isMarketingOptIn: z.boolean().optional()
}).strict().refine(
  data => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update'
  }
);

/**
 * Authentication schemas removed - only OAuth authentication is supported
 */

/**
 * User ID param schema
 */
export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
}).strict();

/**
 * User filter schema with enhanced validation
 */
export const userFilterSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().max(100, 'Search term too long').optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  page: z.coerce.number().int().positive('Page must be a positive integer').optional().default(1),
  limit: z.coerce.number().int().positive('Limit must be a positive integer').max(100, 'Maximum limit is 100 items per page').optional().default(20),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'role', 'authProvider', 'lastLoginAt']).optional().default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  lastLoginAfter: z.string().datetime().optional(),
  lastLoginBefore: z.string().datetime().optional(),
  hasVerifiedEmail: z.boolean().optional(),
  country: z.string().regex(COUNTRY_CODE_REGEX, 'Country must be a valid ISO 3166-1 alpha-2 code').optional()
}).strict();

/**
 * User notification preferences schema
 */
export const updateNotificationPreferencesSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format')
  }),
  body: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    newInvestmentAlerts: z.boolean().optional(),
    securityAlerts: z.boolean().optional(),
    accountUpdates: z.boolean().optional()
  }).refine(
    data => Object.keys(data).length > 0,
    {
      message: 'At least one preference must be provided'
    }
  )
});

/**
 * User display preferences schema
 */
export const updateDisplayPreferencesSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format')
  }),
  body: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().length(2, 'Language code must be ISO 639-1 format (2 characters)').optional(),
    timezone: z.string().optional(),
    dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
    currency: z.string().length(3, 'Currency code must be ISO 4217 format (3 characters)').optional()
  }).refine(
    data => Object.keys(data).length > 0,
    {
      message: 'At least one preference must be provided'
    }
  )
});

// Export types derived from the schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserParams = z.infer<typeof userIdParamSchema>;
export type UserFilter = z.infer<typeof userFilterSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>['body'];
export type UpdateDisplayPreferencesInput = z.infer<typeof updateDisplayPreferencesSchema>['body'];
