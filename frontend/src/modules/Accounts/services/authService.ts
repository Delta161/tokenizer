import apiClient from '@/services/apiClient';
import type { LoginCredentials, RegisterData, AuthResponse, TokenRefreshResponse } from '../types/authTypes';
import { handleServiceError } from '../utils/errorHandling';
import {
  mapBackendAuthResponseToFrontend,
  mapLoginCredentialsToBackend,
  mapRegisterDataToBackend,
  mapBackendTokenRefreshToFrontend
} from '../utils/mappers';

/**
 * Auth Service
 * Handles all API calls related to authentication
 */
export const AuthService = {
  /**
   * Login user with email and password
   * @param credentials - User login credentials
   * @returns Promise with user data and tokens
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const backendCredentials = mapLoginCredentialsToBackend(credentials);
      const response = await apiClient.post('/accounts/auth/login', backendCredentials);
      return mapBackendAuthResponseToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to login. Please check your credentials.');
    }
  },

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise with user data and tokens
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const backendUserData = mapRegisterDataToBackend(userData);
      const response = await apiClient.post('/accounts/auth/register', backendUserData);
      return mapBackendAuthResponseToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to register. Please check your information.');
    }
  },

  /**
   * Logout current user
   * @returns Promise with success message
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/accounts/auth/logout');
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
      const response = await apiClient.get('/accounts/auth/profile');
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
      const response = await apiClient.post('/accounts/auth/refresh', { refreshToken });
      return mapBackendTokenRefreshToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to refresh authentication token.');
    }
  }
};