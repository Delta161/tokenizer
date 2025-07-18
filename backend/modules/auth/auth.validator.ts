import { z } from 'zod';

/**
 * Validator for refresh token request
 * Currently, the refresh token is sent via cookies, so no body validation is needed
 * This is a placeholder for future extensions
 */
export const RefreshTokenSchema = z.object({
  // No fields required as refresh token is sent via cookies
}).strict();

/**
 * Validator for logout request
 * Currently, no body validation is needed
 * This is a placeholder for future extensions
 */
export const LogoutSchema = z.object({
  // No fields required as tokens are sent via cookies
}).strict();

/**
 * Validator for auth error response
 */
export const AuthErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  tokenStatus: z.enum(['expired', 'invalid', 'revoked']).optional(),
  canRefresh: z.boolean().optional()
}).strict();

/**
 * Validator for auth success response
 */
export const AuthSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    role: z.enum(['INVESTOR', 'CLIENT', 'ADMIN']),
    authProvider: z.string()
  }).optional()
}).strict();

/**
 * Validator for token refresh response
 */
export const TokenRefreshResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional()
}).strict();