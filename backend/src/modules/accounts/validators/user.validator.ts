/**
 * User Module Validators
 * Contains Zod schemas for validating user-related requests
 */

// External packages
import { z } from 'zod';

// Internal modules
import type { UserRole } from '@modules/accounts/types/auth.types';

/**
 * Create user schema
 * Note: Password is optional as we only support OAuth authentication
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(), // Optional as we only support OAuth authentication
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole).optional()
}).strict();

/**
 * Update user schema
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.nativeEnum(UserRole).optional()
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
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt', 'role']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional()
}).strict();