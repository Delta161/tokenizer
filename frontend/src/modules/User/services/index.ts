import type { User, UserUpdate, UserSearchParams, UserSearchResult } from '../types';

/**
 * User Service
 * Handles API calls related to user management
 */
export class UserService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }
  
  /**
   * Get the current authenticated user
   * @returns Promise<User>
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${this.apiUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch current user');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch current user');
    }
  }
  
  /**
   * Get a user by ID
   * @param userId - The ID of the user to fetch
   * @returns Promise<User>
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch user with ID ${userId}`);
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || `Failed to fetch user with ID ${userId}`);
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
      const response = await fetch(`${this.apiUrl}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
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
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('query', params.query);
      if (params.role) queryParams.append('role', params.role);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await fetch(`${this.apiUrl}/users?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to search users');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search users');
    }
  }
  
  /**
   * Delete a user
   * @param userId - The ID of the user to delete
   * @returns Promise<void>
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to delete user with ID ${userId}`);
      }
    } catch (error: any) {
      throw new Error(error.message || `Failed to delete user with ID ${userId}`);
    }
  }
}