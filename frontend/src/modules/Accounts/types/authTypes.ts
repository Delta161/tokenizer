/**
 * Auth Types
 * 
 * This file defines the types used for authentication in the Accounts module.
 */

/**
 * Login credentials for authentication
 * Note: Password field removed as only OAuth authentication is supported
 */
export interface LoginCredentials {
  email: string;
  // password field removed - only OAuth authentication is supported
}

/**
 * Registration data for new user accounts
 * Note: Password field removed as only OAuth authentication is supported
 */
export interface RegisterData {
  email: string;
  // password field removed - only OAuth authentication is supported
  firstName: string;
  lastName: string;
}

/**
 * Authentication response from the API
 */
export interface AuthResponse {
  user: import('./userTypes').User;
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

// Password reset types removed - only OAuth authentication is supported