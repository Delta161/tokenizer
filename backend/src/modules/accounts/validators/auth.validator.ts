/**
 * Auth Module Validators
 * Contains Zod schemas for validating auth-related requests
 */

// External packages
import { z } from 'zod';

// Internal modules
import type { UserRole } from '@modules/accounts/types/auth.types';

/**
 * Token verification schema
 */
export const VerifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

/**
 * OAuth profile validation schema
 */
export const OAuthProfileSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  id: z.string().min(1, 'Provider ID is required'),
  displayName: z.string().optional(),
  name: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional()
  }).optional(),
  emails: z.array(
    z.object({
      value: z.string().email('Invalid email format'),
      verified: z.boolean().optional()
    })
  ).optional(),
  photos: z.array(
    z.object({
      value: z.string().url('Invalid photo URL')
    })
  ).optional(),
  _json: z.any().optional()
});

/**
 * Normalized profile validation schema
 */
export const NormalizedProfileSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  role: z.enum(['INVESTOR', 'CLIENT', 'ADMIN']).optional()
});
