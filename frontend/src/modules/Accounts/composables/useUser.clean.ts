/**
 * User Composable
 * 
 * This composable provides access to user data and functionality.
 */

import { ref, computed } from 'vue';
import { UserService } from '../services/user.service';
import type { User, UserProfile, CreateUserRequest, UpdateUserRequest } from '../types/user.types';
import { useUserStore } from '../stores/user.store';

export function useUser() {
  const userService = new UserService();
  const userStore = useUserStore();
  
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const currentUser = computed(() => userStore.currentUser);
  const isAdmin = computed(() => userStore.isAdmin);
  const isAuthenticated = computed(() => userStore.isAuthenticated);
  
  /**
   * Fetch the current user
   */
  async function fetchCurrentUser(): Promise<User | null> {
    loading.value = true;
    error.value = null;
    
    try {
      await userStore.fetchCurrentUser();
      return currentUser.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch current user';
      console.error('Error fetching current user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Get a user by ID
   */
  async function getUserById(id: string): Promise<User | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const user = await userStore.getUserById(id);
      return user || null;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user';
      console.error('Error fetching user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Get the current user's profile
   */
  async function getUserProfile(): Promise<UserProfile | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const profile = await userService.getUserProfile();
      return profile;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user profile';
      console.error('Error fetching user profile:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Update current user profile
   */
  async function updateUserProfile(profileData: Partial<UserProfile>): Promise<User | null> {
    loading.value = true;
    error.value = null;
    
    try {
      await userStore.updateUserProfile(profileData);
      return currentUser.value;
    } catch (err: any) {
      error.value = err.message || 'Failed to update user profile';
      console.error('Error updating user profile:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // =============================================================================
  // ADMIN FUNCTIONS
  // =============================================================================

  /**
   * Fetch all users (admin only)
   */
  async function fetchUsers(params?: { page?: number; limit?: number; role?: string }) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await userStore.fetchUsers(params);
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users';
      console.error('Error fetching users:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a new user (admin only)
   */
  async function createUser(userData: CreateUserRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const newUser = await userStore.createUser(userData);
      return newUser;
    } catch (err: any) {
      error.value = err.message || 'Failed to create user';
      console.error('Error creating user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update a user (admin only)
   */
  async function updateUserById(userId: string, userData: UpdateUserRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedUser = await userStore.updateUser(userId, userData);
      return updatedUser;
    } catch (err: any) {
      error.value = err.message || 'Failed to update user';
      console.error('Error updating user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a user (admin only)
   */
  async function deleteUser(userId: string) {
    loading.value = true;
    error.value = null;
    
    try {
      await userStore.deleteUser(userId);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user';
      console.error('Error deleting user:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    loading,
    error,
    currentUser,
    isAdmin,
    isAuthenticated,
    
    // User data
    users: computed(() => userStore.users),
    usersList: computed(() => userStore.usersList),
    totalUsers: computed(() => userStore.totalUsers),
    hasMoreUsers: computed(() => userStore.hasMoreUsers),
    adminLoading: computed(() => userStore.adminLoading),
    
    // Methods
    fetchCurrentUser,
    getUserById,
    getUserProfile,
    updateUserProfile,
    
    // Admin methods
    fetchUsers,
    createUser,
    updateUserById,
    deleteUser
  };
}
