/**
 * User Service
 * Complete service covering all backend user endpoints
 * Updated to work with refactored backend user endpoints.
 */

import apiClient from '../../../services/apiClient';
import type { User, UserProfile, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../types/user.types';
import { handleServiceError } from '../utils/errorHandling';

export interface UserFilterOptions {
  role?: 'INVESTOR' | 'CLIENT' | 'ADMIN';
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export class UserService {
  private baseUrl = '/users';

  // =============================================================================
  // CURRENT USER PROFILE ENDPOINTS
  // =============================================================================

  /**
   * Get current user profile via /users/me
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/me`);
      const user = response.data.data;
      return this.normalizeUserDates(user);
    } catch (error) {
      handleServiceError(error, 'Failed to fetch current user data.');
      throw error;
    }
  }

  /**
   * Get current user profile via /users/profile (alias)
   */
  async getUserProfile(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/profile`);
      const user = response.data.data;
      return this.normalizeUserDates(user);
    } catch (error) {
      handleServiceError(error, 'Failed to fetch user profile data.');
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/me`, userData);
      const user = response.data.data;
      return this.normalizeUserDates(user);
    } catch (error) {
      handleServiceError(error, 'Failed to update user profile.');
      throw error;
    }
  }

  /**
   * Update user profile via /users/profile endpoint
   */
  async updateUserProfile(userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/profile`, userData);
      const user = response.data.data;
      return this.normalizeUserDates(user);
    } catch (error) {
      handleServiceError(error, 'Failed to update user profile.');
      throw error;
    }
  }

  // =============================================================================
  // ADMIN USER MANAGEMENT ENDPOINTS  
  // =============================================================================

  /**
   * Get all users with pagination and filtering (admin only)
   */
  async getUsers(options?: {
    page?: number;
    limit?: number;
    filters?: UserFilterOptions;
    sort?: { field: string; direction: 'asc' | 'desc' };
  }): Promise<UserListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.filters?.role) params.append('role', options.filters.role);
      if (options?.filters?.search) params.append('search', options.filters.search);
      if (options?.filters?.createdAfter) params.append('createdAfter', options.filters.createdAfter);
      if (options?.filters?.createdBefore) params.append('createdBefore', options.filters.createdBefore);
      if (options?.sort) {
        params.append('sortField', options.sort.field);
        params.append('sortDirection', options.sort.direction);
      }

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      
      return {
        users: response.data.data.users.map((user: any) => this.normalizeUserDates(user)),
        total: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
        hasMore: response.data.data.page < response.data.data.totalPages
      };
    } catch (error) {
      handleServiceError(error, 'Failed to fetch users list.');
      throw error;
    }
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post(`${this.baseUrl}`, userData);
      const user = response.data.data;
      return this.normalizeUserDates(user);
    } catch (error) {
      handleServiceError(error, 'Failed to create user.');
      throw error;
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${userId}`);
      const user = response.data.data;
      return this.normalizeUserDates(user);
    } catch (error) {
      handleServiceError(error, 'Failed to fetch user details.');
      throw error;
    }
  }

  /**
   * Update user by ID (admin only)
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${userId}`, userData);
      const user = response.data.data;
      return this.normalizeUserDates(user);
    } catch (error) {
      handleServiceError(error, 'Failed to update user.');
      throw error;
    }
  }

  /**
   * Delete user by ID (admin only)
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${userId}`);
      return { message: response.data.message || 'User deleted successfully' };
    } catch (error) {
      handleServiceError(error, 'Failed to delete user.');
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Normalize date fields to strings for consistency
   */
  private normalizeUserDates(user: any): User {
    return {
      ...user,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
      lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt) : undefined
    };
  }
}

export const userService = new UserService();