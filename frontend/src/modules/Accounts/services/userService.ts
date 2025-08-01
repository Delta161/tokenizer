/**
 * User Service
 *
 * This service handles all API calls related to users.
 * It uses apiClient, which should have its baseURL set to `/api/v1`.
 */

import apiClient from '../../../services/apiClient';
import type {
  User,
  UserProfile,
  UserUpdate,
  UserSearchParams,
  UserSearchResult,
} from '../types/userTypes';
import { handleServiceError } from '../utils/errorHandling';
import {
  mapBackendUserToFrontend,
  mapFrontendUserToBackend,
  mapBackendUsersToFrontend,
  mapBackendProfileToFrontend,
  mapFrontendProfileToBackend,
  mapSearchParamsToBackend,
  mapBackendSearchResultToFrontend,
} from '../utils/mappers';

export class UserService {
  private baseUrl = '/users';

  /**
   * Get the current logged-in user's data (profile).
   * Calls GET /users/profile.
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/profile`);
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to retrieve current user.');
    }
  }

  /**
   * Get a user by ID (admin use case).
   * Calls GET /users/{id}.
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, `Failed to retrieve user with ID: ${id}.`);
    }
  }

  /**
   * Update the current user's profile.
   * Calls PATCH /users/profile.
   */
  async updateCurrentUser(profileData: Partial<UserProfile>): Promise<User> {
    try {
      const backendData = mapFrontendProfileToBackend(profileData);
      const response = await apiClient.patch(`${this.baseUrl}/profile`, backendData);
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to update current user.');
    }
  }

  /**
   * Update a user by ID (admin use case).
   * Calls PATCH /users/{id}.
   */
  async updateUser(id: string, userData: UserUpdate): Promise<User> {
    try {
      const backendData = mapFrontendUserToBackend(userData);
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, backendData);
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, `Failed to update user with ID: ${id}.`);
    }
  }

  /**
   * Get all users (admin use case).
   * Calls GET /users.
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return mapBackendUsersToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to retrieve all users.');
    }
  }

  /**
   * Search users with query parameters (admin use case).
   * Calls GET /users/search with URL params.
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    try {
      const backendParams = mapSearchParamsToBackend(params);
      const response = await apiClient.get(`${this.baseUrl}/search`, {
        params: backendParams,
      });
      return mapBackendSearchResultToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to search users.');
    }
  }

  /**
   * Delete a user by ID (admin use case).
   * Calls DELETE /users/{id}.
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      return handleServiceError(error, `Failed to delete user with ID: ${id}.`);
    }
  }
}
