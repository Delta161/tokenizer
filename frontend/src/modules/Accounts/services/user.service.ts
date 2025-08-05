/**
 * User Service
 * Updated to work with refactored backend user endpoints.
 */

import apiClient from '../../../services/apiClient';
import type { User, UserProfile } from '../types/user.types';
import { handleServiceError } from '../utils/errorHandling';

export class UserService {
  private baseUrl = '/users';

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/me`);
      const user = response.data.data;
      return {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
        lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt) : undefined
      };
    } catch (error) {
      handleServiceError(error, 'Failed to fetch current user data.');
      throw error;
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/profile`);
      const user = response.data.data;
      return {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
        lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt) : undefined
      };
    } catch (error) {
      handleServiceError(error, 'Failed to fetch user profile data.');
      throw error;
    }
  }

  async updateCurrentUser(userData: Partial<UserProfile>): Promise<User> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/me`, userData);
      const user = response.data.data;
      return {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
        lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt) : undefined
      };
    } catch (error) {
      handleServiceError(error, 'Failed to update current user.');
      throw error;
    }
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<User> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/profile`, profileData);
      const user = response.data.data;
      return {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
        lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt) : undefined
      };
    } catch (error) {
      handleServiceError(error, 'Failed to update user profile.');
      throw error;
    }
  }
}

export const userService = new UserService();