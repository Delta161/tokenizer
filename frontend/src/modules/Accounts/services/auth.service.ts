import apiClient from '@/services/apiClient';
import type { AuthResponse } from '../types/auth.types';
import { handleServiceError } from '../utils/errorHandling';

/**
 * Auth Service
 * Handles all API calls related to session-based authentication
 * Updated to work with session management and HTTP-only cookies
 */
export const AuthService = {
  /**
   * Get current user profile from /auth/profile endpoint
   * Uses session cookies for authentication
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const response = await apiClient.get('/auth/profile');
      // Backend returns { success: true, data: { user: userObject } }
      return response.data.data.user;
    } catch (error) {
      handleServiceError(error, 'Failed to retrieve user profile.');
      throw error;
    }
  },

  /**
   * Logout current user via /auth/logout endpoint
   * Destroys session and clears cookies
   * @returns Promise with success message
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/logout');
      // Backend returns { success: true, message: string }
      return { message: response.data.message || 'Logged out successfully' };
    } catch (error) {
      handleServiceError(error, 'Failed to logout properly.');
      throw error;
    }
  },

  /**
   * Check if user is authenticated by calling profile endpoint
   * @returns Promise with authentication status and user data
   */
  async checkAuth(): Promise<{ isAuthenticated: boolean; user?: AuthResponse['user'] }> {
    try {
      const user = await this.getCurrentUser();
      return { isAuthenticated: true, user };
    } catch (error) {
      return { isAuthenticated: false };
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
   * Get OAuth login URL for Apple
   * @returns Apple OAuth URL  
   */
  getAppleLoginUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/api/v1/auth/apple`;
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
      throw error;
    }
  }
};