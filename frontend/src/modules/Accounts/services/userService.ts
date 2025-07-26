/**
 * User Service
 * 
 * This service handles all API calls related to users.
 */

import apiClient from '../../../services/apiClient';
import type { User, UserProfile, UserSettings, UserUpdate, UserSearchParams, UserSearchResult } from '../types/userTypes';
import { handleServiceError } from '../utils/errorHandling';
import {
  mapBackendUserToFrontend,
  mapFrontendUserToBackend,
  mapBackendUsersToFrontend,
  mapBackendProfileToFrontend,
  mapFrontendProfileToBackend,
  mapBackendSettingsToFrontend,
  mapFrontendSettingsToBackend,
  mapSearchParamsToBackend,
  mapBackendSearchResultToFrontend
} from '../utils/mappers';


export class UserService {
  private baseUrl = '/api/users';

  /**
   * Get the current logged-in user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/me`);
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to retrieve current user.');
    }
  }

  /**
   * Get a user by ID
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
   * Get user profile
   */
  async getUserProfile(id: string): Promise<UserProfile> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/profile`);
      return mapBackendProfileToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, `Failed to retrieve user profile for ID: ${id}.`);
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(id: string): Promise<UserSettings> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/settings`);
      return mapBackendSettingsToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, `Failed to retrieve user settings for ID: ${id}.`);
    }
  }

  /**
   * Update a user
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
   * Update user profile
   */
  async updateUserProfile(id: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const backendProfileData = mapFrontendProfileToBackend(profileData);
      const response = await apiClient.patch(`${this.baseUrl}/${id}/profile`, backendProfileData);
      return mapBackendProfileToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, `Failed to update profile for user ID: ${id}.`);
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(id: string, settingsData: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const backendSettingsData = mapFrontendSettingsToBackend(settingsData);
      const response = await apiClient.patch(`${this.baseUrl}/${id}/settings`, backendSettingsData);
      return mapBackendSettingsToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, `Failed to update settings for user ID: ${id}.`);
    }
  }

  /**
   * Get all users
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
   * Search users
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    try {
      const backendParams = mapSearchParamsToBackend(params);
      const response = await apiClient.get(`${this.baseUrl}/search`, { params: backendParams });
      return mapBackendSearchResultToFrontend(response.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to search users.');
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      return handleServiceError(error, `Failed to delete user with ID: ${id}.`);
    }
  }
}

// Mapping functions have been moved to ../utils/mappers