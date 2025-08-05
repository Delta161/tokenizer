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
} from '../types/user.types';
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
   * Get the current authenticated user's data.
   * Calls GET /users/me.
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/me`);
      // Backend returns { success: true, data: userObject, ... }
      return mapBackendUserToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, 'Failed to fetch current user data.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  }

  /**
   * Get a user by ID.
   * Calls GET /users/{id}.
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      // Backend returns { success: true, data: userObject, ... }
      return mapBackendUserToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, `Failed to retrieve user with ID: ${id}.`);
      throw error; // This will never be reached as handleServiceError throws by default
    }
  }

  /**
   * Update the current authenticated user's profile data.
   * Calls PUT /users/me.
   */
  async updateCurrentUser(profileData: Partial<UserProfile>): Promise<User> {
    try {
      // The profileData doesn't need an id for the current user endpoint
      const backendData = mapFrontendProfileToBackend(profileData as UserProfile);
      const response = await apiClient.put(`${this.baseUrl}/me`, backendData);
      // Backend returns { success: true, data: userObject, ... }
      return mapBackendUserToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, 'Failed to update current user.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  }

  /**
   * Update a user by ID (admin use case).
   * Calls PUT /users/{id}.
   */
  async updateUser(id: string, userData: Partial<UserUpdate>): Promise<User> {
    try {
      const backendData = mapFrontendUserToBackend(userData);
      const response = await apiClient.put(`${this.baseUrl}/${id}`, backendData);
      // Backend returns { success: true, data: userObject, ... }
      return mapBackendUserToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, `Failed to update user with ID: ${id}.`);
      throw error; // This will never be reached as handleServiceError throws by default
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
      handleServiceError(error, 'Failed to retrieve all users.');
      throw error; // This will never be reached as handleServiceError throws by default
    }
  }

  /**
   * Search users with filters and pagination.
   * Calls GET /users/search.
   */
  async searchUsers(searchParams: UserSearchParams): Promise<UserSearchResult> {
    try {
      const backendParams = mapSearchParamsToBackend(searchParams);
      const response = await apiClient.get(`${this.baseUrl}/search`, { params: backendParams });
      return mapBackendSearchResultToFrontend(response.data);
    } catch (error) {
      handleServiceError(error, 'Failed to search users.');
      throw error; // This will never be reached as handleServiceError throws by default
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
      handleServiceError(error, `Failed to delete user with ID: ${id}.`);
      throw error; // This will never be reached as handleServiceError throws by default
    }
  }
}
