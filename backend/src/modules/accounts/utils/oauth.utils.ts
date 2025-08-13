/**
 * OAuth Utilities
 * Pure utility functions for OAuth data transformations and validations
 * Following 7-layer architecture - Utils Layer
 */

import type { OAuthProfileDTO } from '../types/auth.types';
import { logger } from '../../../utils/logger';

/**
 * Convert Prisma user to OAuth profile with comprehensive mapping
 */
export function convertPrismaUserToOAuthProfile(prismaUser: any): OAuthProfileDTO {
  if (!prismaUser) {
    throw new Error('User data is required for OAuth profile conversion');
  }

  const [firstName, ...lastNameParts] = (prismaUser.fullName || '').split(' ');
  const lastName = lastNameParts.join(' ');
  
  return {
    provider: (prismaUser.authProvider?.toLowerCase() || 'google'),
    id: prismaUser.providerId || prismaUser.id,
    displayName: prismaUser.fullName || 'User',
    name: {
      givenName: firstName || '',
      familyName: lastName || ''
    },
    emails: [
      {
        value: prismaUser.email,
        verified: true
      }
    ],
    photos: prismaUser.avatarUrl ? [
      {
        value: prismaUser.avatarUrl
      }
    ] : [],
    _json: {}
  };
}

/**
 * OAuth profile type detection guard
 */
export function isOAuthProfile(user: any): user is OAuthProfileDTO {
  if (!user || typeof user !== 'object') {
    return false;
  }
  
  return Boolean(
    user.provider ||
    (user.emails && Array.isArray(user.emails)) ||
    (user.name && typeof user.name === 'object' && (user.name.givenName || user.name.familyName)) ||
    user.displayName
  );
}

/**
 * Sanitize response data by removing sensitive fields
 */
export function sanitizeAuthResponse(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Remove all sensitive fields
  const {
    hash,
    providerId,
    _json,
    ...sanitized
  } = data;

  return sanitized;
}

/**
 * Build OAuth redirect URL with error parameters
 */
export function buildOAuthErrorUrl(
  frontendUrl: string,
  errorPath: string,
  error: string,
  provider: string
): string {
  const errorParams = new URLSearchParams({
    error: error.substring(0, 200), // Limit error message length
    provider: provider.substring(0, 50), // Limit provider name length
    timestamp: new Date().toISOString()
  });

  const errorRedirectUrl = `${frontendUrl}${errorPath}?${errorParams.toString()}`;

  // Validate constructed URL
  try {
    new URL(errorRedirectUrl);
    return errorRedirectUrl;
  } catch (urlValidationError) {
    logger.warn('Invalid OAuth error URL constructed, using fallback', {
      attemptedUrl: errorRedirectUrl,
      error: urlValidationError
    });
    // Return safe fallback
    return `${frontendUrl}/auth/error`;
  }
}

/**
 * Build OAuth success redirect URL
 */
export function buildOAuthSuccessUrl(frontendUrl: string, successPath: string): string {
  const successUrl = `${frontendUrl}${successPath}`;
  
  try {
    new URL(successUrl);
    return successUrl;
  } catch (urlValidationError) {
    logger.warn('Invalid OAuth success URL constructed, using fallback', {
      attemptedUrl: successUrl,
      error: urlValidationError
    });
    return `${frontendUrl}/dashboard`;
  }
}

/**
 * Create standardized success response structure
 */
export function createAuthSuccessResponse(data: any, message: string = 'Success'): object {
  return {
    success: true,
    message,
    data: sanitizeAuthResponse(data),
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}
