/**
 * User Service
 * 
 * This service handles all API calls related to users.
 */

import apiClient from '../../../services/apiClient';
import type { User, UserProfile, UserSettings, UserUpdate, UserSearchParams, UserSearchResult } from '../types/userTypes';

export class UserService {
  private baseUrl = '/api/users';

  /**
   * Get the current logged-in user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get(`${this.baseUrl}/me`);
    return mapBackendUserToFrontend(response.data);
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return mapBackendUserToFrontend(response.data);
  }

  /**
   * Get user profile
   */
  async getUserProfile(id: string): Promise<UserProfile> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/profile`);
    return response.data;
  }

  /**
   * Get user settings
   */
  async getUserSettings(id: string): Promise<UserSettings> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/settings`);
    return response.data;
  }

  /**
   * Update a user
   */
  async updateUser(id: string, userData: UserUpdate): Promise<User> {
    const backendData = mapFrontendUserToBackend(userData);
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, backendData);
    return mapBackendUserToFrontend(response.data);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(id: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/profile`, profileData);
    return response.data;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(id: string, settingsData: Partial<UserSettings>): Promise<UserSettings> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/settings`, settingsData);
    return response.data;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get(this.baseUrl);
    return mapBackendUsersToFrontend(response.data);
  }

  /**
   * Search users
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    const response = await apiClient.get(`${this.baseUrl}/search`, { params });
    const result = response.data;
    return {
      ...result,
      users: mapBackendUsersToFrontend(result.users)
    };
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

/**
 * Map backend user to frontend user
 */
export function mapBackendUserToFrontend(backendUser: any): User {
  // Handle the case where the backend returns fullName instead of firstName/lastName
  let firstName = backendUser.firstName;
  let lastName = backendUser.lastName;

  if (!firstName && !lastName && backendUser.fullName) {
    const nameParts = backendUser.fullName.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }

  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    role: backendUser.role,
    avatar: backendUser.avatar,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt
  };
}

/**
 * Map frontend user to backend user
 */
export function mapFrontendUserToBackend(frontendUser: Partial<User>): any {
  // If both firstName and lastName are provided, we can compute fullName
  const fullName = frontendUser.firstName && frontendUser.lastName
    ? `${frontendUser.firstName} ${frontendUser.lastName}`.trim()
    : undefined;

  return {
    ...frontendUser,
    fullName
  };
}

/**
 * Map backend users to frontend users
 */
export function mapBackendUsersToFrontend(backendUsers: any[]): User[] {
  return backendUsers.map(mapBackendUserToFrontend);
}