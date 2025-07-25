import type { User, UserUpdate, UserSearchParams, UserSearchResult } from '../types';
import { mapBackendUserToFrontend, mapBackendUsersToFrontend, mapFrontendUserToBackend } from '../utils/userMapper';
import apiClient from '@/services/apiClient';

/**
 * User Service
 * Handles API calls related to user management
 */
export class UserService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = '/users';
  }
  
  /**
   * Get the current authenticated user
   * @returns Promise<User>
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.apiUrl}/me`);
      return mapBackendUserToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch current user');
    }
  }
  
  /**
   * Get a user by ID
   * @param userId - The ID of the user to fetch
   * @returns Promise<User>
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.apiUrl}/${userId}`);
      return mapBackendUserToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || `Failed to fetch user with ID ${userId}`);
    }
  }
  
  /**
   * Update a user
   * @param userId - The ID of the user to update
   * @param userData - The user data to update
   * @returns Promise<User>
   */
  async updateUser(userId: string, userData: UserUpdate): Promise<User> {
    try {
      // Convert frontend user data to backend format
      const backendUserData = {
        ...userData,
        fullName: userData.firstName && userData.lastName ? 
          `${userData.firstName} ${userData.lastName}`.trim() : 
          undefined
      };
      
      // Remove firstName and lastName as they don't exist in the backend model
      if ('firstName' in backendUserData) delete backendUserData.firstName;
      if ('lastName' in backendUserData) delete backendUserData.lastName;
      
      const response = await apiClient.patch(`${this.apiUrl}/${userId}`, backendUserData);
      return mapBackendUserToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }
  
  /**
   * Search users
   * @param params - Search parameters
   * @returns Promise<UserSearchResult>
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    try {
      // Convert params to query string
      const queryParams: Record<string, any> = {};
      
      if (params.query) queryParams.query = params.query;
      if (params.role) queryParams.role = params.role;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      
      const response = await apiClient.get(this.apiUrl, { params: queryParams });
      
      // Map the users array to frontend format
      return {
        ...response.data,
        users: mapBackendUsersToFrontend(response.data.users)
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }
  
  /**
   * Delete a user
   * @param userId - The ID of the user to delete
   * @returns Promise<void>
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.apiUrl}/${userId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || `Failed to delete user with ID ${userId}`);
    }
  }
}