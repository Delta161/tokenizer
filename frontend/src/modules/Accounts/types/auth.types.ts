/**
 * Auth Types
 * 
 * This file defines the types used for authentication in the Accounts module.
 * Updated to match backend AuthResponseDTO and related types.
 */

import type { User, UserRole } from './user.types';

/**
 * Authentication response from the API
 * Matches backend AuthResponseDTO structure
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh response from the API
 */
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

/**
 * OAuth profile data structure
 * Matches backend OAuthProfileDTO
 */
export interface OAuthProfile {
  provider: string;
  id: string;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  _json?: any;
}

/**
 * Token payload structure
 * Matches backend TokenPayload
 */
export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Legacy interfaces kept for backward compatibility but deprecated
// These are no longer used as only OAuth authentication is supported

/**
 * @deprecated Use OAuth authentication instead
 */
export interface LoginCredentials {
  email: string;
}

/**
 * @deprecated Use OAuth authentication instead
 */
export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
}