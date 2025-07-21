/**
 * User Module Validators
 * Contains Zod schemas for validating user-related requests
 */

// External packages
import { z } from 'zod';

// Internal modules
import { UserRole } from '@modules/accounts/types/auth.types';
import { AuthProvider } from '@prisma/client';

/**
 * Create user schema
 * Note: Password is optional as we only support OAuth authentication
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(1, 'Full name is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  role: z.nativeEnum(UserRole).optional(),
  phone: z.string().optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
  authProvider: z.nativeEnum(AuthProvider)
}).strict();

/**
 * Update user schema
 */
export const updateUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  phone: z.string().optional(),
  preferredLanguage: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  timezone: z.string().optional()
}).strict();

/**
 * Change password schema removed - only OAuth authentication is supported
 */

/**
 * User ID param schema
 */
export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
}).strict();

/**
 * User filter schema
 */
export const userFilterSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'role', 'authProvider']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional()
}).strict();
