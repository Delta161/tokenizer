// Auth Module Types

/**
 * User interface representing an authenticated user
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Available user roles in the system
 */
export type UserRole = 'ADMIN' | 'CLIENT' | 'INVESTOR';

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
  user: User;
  token: string;
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