import apiClient from '@/services/apiClient';
import type { AuthResponse, TokenRefreshResponse } from '../types/auth.types';
import { handleServiceError } from '../utils/errorHandling';

/**
 * Auth Service
 * Handles all API calls related to authentication
 * Updated to work with refactored backend OAuth-only authentication
 */
export const AuthService = {
  /**
   * Get current user profile from /auth/profile endpoint
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const response = await apiClient.get('/auth/profile');
      // Backend returns { success: true, data: { user: userObject } }
      return response.data.data.user;
    } catch (error) {
      handleServiceError(error, 'Failed to retrieve user profile.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  },

  /**
   * Logout current user via /auth/logout endpoint
   * @returns Promise with success message
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/logout');
      // Backend returns { success: true, message: string }
      return { message: response.data.message || 'Logged out successfully' };
    } catch (error) {
      handleServiceError(error, 'Failed to logout properly.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  },

  /**
   * Refresh access token using refresh token via /auth/refresh-token endpoint
   * @param refreshToken - Refresh token (optional, can be sent via cookie)
   * @returns Promise with new access token and user data
   */
  async refreshToken(refreshToken?: string): Promise<TokenRefreshResponse & { user?: AuthResponse['user'] }> {
    try {
      const body = refreshToken ? { refreshToken } : {};
      const response = await apiClient.post('/auth/refresh-token', body);
      
      // Backend returns { success: true, data: { accessToken, user }, message: string }
      return {
        accessToken: response.data.data.accessToken,
        user: response.data.data.user
      };
    } catch (error) {
      handleServiceError(error, 'Failed to refresh authentication token.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  },

  /**
   * Verify current token via /auth/verify-token endpoint
   * @returns Promise with token validation result and user data
   */
  async verifyToken(): Promise<{ valid: boolean; user?: AuthResponse['user']; error?: string }> {
    try {
      const response = await apiClient.get('/auth/verify-token');
      // Backend returns { valid: boolean, data?: { user }, error?, timestamp }
      return {
        valid: response.data.valid,
        user: response.data.data?.user,
        error: response.data.error
      };
    } catch (error) {
      handleServiceError(error, 'Failed to verify authentication token.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  },

  /**
   * Get OAuth login URL for Google
   * @returns Google OAuth URL
   */
  getGoogleLoginUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/api/v1/auth/google`;
  },

  /**
   * Get OAuth login URL for Azure
   * @returns Azure OAuth URL  
   */
  getAzureLoginUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/api/v1/auth/azure`;
  },

  /**
   * Check auth service health
   * @returns Promise with health check data
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await apiClient.get('/auth/health');
      return response.data;
    } catch (error) {
      handleServiceError(error, 'Failed to check auth service health.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  }

  // Deprecated methods - kept for backward compatibility
  /**
   * @deprecated Use OAuth authentication instead
   */
  // async login(_credentials: any): Promise<AuthResponse> {
  //   return handleServiceError(
  //     new Error('Direct login with email and password is not supported. Please use OAuth authentication.'),
  //     'Password-based authentication is not supported. Please use the OAuth login options.'
  //   );
  // },

  /**
   * @deprecated Use OAuth authentication instead  
   */
  // async register(_userData: any): Promise<AuthResponse> {
  //   return handleServiceError(
  //     new Error('Direct registration with email and password is not supported. Please use OAuth authentication.'),
  //     'Password-based registration is not supported. Please use the OAuth login options.'
  //   );
  // }
};