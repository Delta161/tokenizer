/**
 * Auth Types
 * 
 * This file defines the types used for authentication in the Accounts module.
 */

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data for new user accounts
 */
export interface RegisterData {
  email: string;
  password: string;
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

/**
 * Password reset request data
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation data
 */
export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}