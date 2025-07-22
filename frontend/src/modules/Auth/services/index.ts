// Auth Module Services
import type { LoginCredentials, RegisterData, AuthResponse, PasswordResetRequest, PasswordResetConfirm } from '../types';
import { mapBackendUserToFrontend } from '../../User/utils/userMapper';

/**
 * Service for handling authentication-related API calls
 */
class AuthService {
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  /**
   * Login with email and password
   * @param credentials - User login credentials
   * @returns Authentication response with user and token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const result = await response.json();
      
      // Map the backend user to frontend format
      return {
        ...result,
        user: mapBackendUserToFrontend(result.user)
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Register a new user
   * @param data - User registration data
   * @returns Authentication response with user and token
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Convert frontend data to backend format
      const backendData = {
        ...data,
        fullName: `${data.firstName} ${data.lastName}`.trim(),
      };
      
      // Remove firstName and lastName as they don't exist in the backend model
      delete backendData.firstName;
      delete backendData.lastName;
      
      const response = await fetch(`${this.apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
        body: JSON.stringify(backendData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const result = await response.json();
      
      // Map the backend user to frontend format
      return {
        ...result,
        user: mapBackendUserToFrontend(result.user)
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies for JWT
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Logout failed');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }
  
  /**
   * Get the current authenticated user
   * @returns Authentication response with user and token
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies for JWT
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get current user');
      }
      
      const result = await response.json();
      
      // Map the backend user to frontend format
      return {
        ...result,
        user: mapBackendUserToFrontend(result.user)
      };
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
  
  /**
   * Request a password reset
   * @param data - Password reset request data
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset request failed');
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }
  
  /**
   * Confirm a password reset
   * @param data - Password reset confirmation data
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset confirmation failed');
      }
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export the class for testing/mocking
export { AuthService };