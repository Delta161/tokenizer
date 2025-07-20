/**
 * User Module Validators
 * Contains Zod schemas for validating user-related requests
 */
import { z } from 'zod';
import { UserRole } from '../auth/auth.types';
/**
 * Create user schema
 */
export const createUserSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
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
 * Change password schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
}).strict();
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
//# sourceMappingURL=user.validators.js.map