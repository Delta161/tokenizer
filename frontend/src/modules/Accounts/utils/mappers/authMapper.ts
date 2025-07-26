/**
 * Auth Mapper
 * 
 * This file provides utility functions for mapping between backend and frontend authentication data structures.
 * It ensures consistent data transformation across the Accounts module.
 */

import type { LoginCredentials, RegisterData, AuthResponse, TokenRefreshResponse } from '../../types/authTypes';
import { mapBackendUserToFrontend } from './userMapper';

/**
 * Map backend auth response to frontend format
 * @param backendResponse Backend authentication response data
 * @returns Frontend authentication response object
 */
export function mapBackendAuthResponseToFrontend(backendResponse: any): AuthResponse {
  if (!backendResponse) return null;
  
  return {
    user: mapBackendUserToFrontend(backendResponse.user),
    accessToken: backendResponse.accessToken,
    refreshToken: backendResponse.refreshToken
  };
}

/**
 * Map frontend login credentials to backend format
 * @param credentials Frontend login credentials
 * @returns Backend login credentials object
 */
export function mapLoginCredentialsToBackend(credentials: LoginCredentials): any {
  if (!credentials) return null;
  
  return {
    email: credentials.email,
    password: credentials.password
  };
}

/**
 * Map backend token refresh response to frontend format
 * @param backendResponse Backend token refresh response data
 * @returns Frontend token refresh response object
 */
export function mapBackendTokenRefreshToFrontend(backendResponse: any): TokenRefreshResponse {
  if (!backendResponse) return null;
  
  return {
    accessToken: backendResponse.accessToken,
    refreshToken: backendResponse.refreshToken
  };
}

// Password reset mapper functions removed - only OAuth authentication is supported