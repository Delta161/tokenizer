import apiClient from '@/services/apiClient';
import type { AuthResponse } from '../types/auth.types';
import { handleServiceError } from '../utils/errorHandling';
import { userService } from './user.service';

/**
 * Auth Service
 * Handles all API calls related to session-based authentication
 * Updated to work with session management and HTTP-only cookies
 * Profile-related functions moved to user service for better separation
 */
export const AuthService = {
  /**
   * Get current user profile - delegates to user service
   * Uses session cookies for authentication
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      return await userService.getCurrentUser();
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
   * Check if user is authenticated using session status endpoint
   * @returns Promise with authentication status and user data
   */
  async checkAuth(): Promise<{ isAuthenticated: boolean; user?: AuthResponse['user'] }> {
    try {
      console.log('🔍 Checking authentication status via session endpoint...');
      const response = await apiClient.get('/auth/session-status');
      const sessionData = response.data;
      
      console.log('📊 Session status response:', sessionData);
      
      if (sessionData.isAuthenticated && sessionData.user) {
        console.log('✅ User is authenticated:', sessionData.user.email);
        return { 
          isAuthenticated: true, 
          user: sessionData.user 
        };
      } else {
        console.log('❌ User is not authenticated');
        return { isAuthenticated: false };
      }
    } catch (error) {
      console.error('❌ Session status check failed:', error);
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