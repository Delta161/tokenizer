import apiClient from '@/services/apiClient';
import type { LoginCredentials, RegisterData, AuthResponse, TokenRefreshResponse } from '../types/authTypes';
import { handleServiceError } from '../utils/errorHandling';
import {
  mapBackendAuthResponseToFrontend,
  mapLoginCredentialsToBackend,
  mapBackendTokenRefreshToFrontend
} from '../utils/mappers';

/**
 * Auth Service
 * Handles all API calls related to authentication
 */
export const AuthService = {
  /**
   * Login user with email and password - REMOVED
   * This method is no longer supported as only OAuth authentication is available
   * @deprecated Use OAuth authentication instead
   */
  async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    return handleServiceError(
      new Error('Direct login with email and password is not supported. Please use OAuth authentication.'),
      'Password-based authentication is not supported. Please use the OAuth login options.'
    );
  },

  /**
   * Register a new user - REMOVED
   * This method is no longer supported as only OAuth authentication is available
   * @deprecated Use OAuth authentication instead
   */
  async register(_userData: RegisterData): Promise<AuthResponse> {
    return handleServiceError(
      new Error('Direct registration with email and password is not supported. Please use OAuth authentication.'),
      'Password-based registration is not supported. Please use the OAuth login options.'
    );
  },

  /**
   * Logout current user
   * @returns Promise with success message
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      return handleServiceError(error, 'Failed to logout properly.');
    }
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const response = await apiClient.get('/auth/profile');
      const authResponse = mapBackendAuthResponseToFrontend({ user: response.data });
      return authResponse.user;
    } catch (error) {
      return handleServiceError(error, 'Failed to retrieve user profile.');
    }
  },

  // Password reset functionality removed - only OAuth authentication is supported
  
  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token
   * @returns Promise with new access token and optionally new refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return mapBackendTokenRefreshToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to refresh authentication token.');
    }
  }
};