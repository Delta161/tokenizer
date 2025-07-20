/**
 * Auth Module Validators
 * Contains Zod schemas for validating auth-related requests
 */

import { z } from 'zod';
import { UserRole } from '../types/auth.types';

/**
 * Login credentials schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
}).strict();

/**
 * Registration data schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole).optional()
}).strict();

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format')
}).strict();

/**
 * Password reset confirmation schema
 */
export const passwordResetConfirmSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters')
}).strict();