/**
 * Auth Module Validators
 * Contains Zod schemas for validating auth-related requests
 */

// External packages
import { z } from 'zod';

// Internal modules

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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  role: z.enum(['INVESTOR', 'CLIENT', 'ADMIN']).optional(),
  _json: z.any().optional()
}).refine(
  // Ensure at least one name field is present
  data => !!(data.firstName || data.lastName || data.displayName),
  {
    message: 'At least one name field (firstName, lastName, or displayName) is required',
    path: ['firstName']
  }
);

/**
 * Relaxed normalized profile validation schema
 * Only requires provider and providerId
 */
export const RelaxedNormalizedProfileSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  email: z.string().optional(), // Removed email validation to make it truly relaxed
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(), // Removed URL validation to make it truly relaxed
  role: z.enum(['INVESTOR', 'CLIENT', 'ADMIN']).optional(),
  _json: z.any().optional()
});
