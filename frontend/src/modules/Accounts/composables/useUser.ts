/**
 * User Composable
 * 
 * This composable provides access to user data and functionality.
 */

import { ref, computed } from 'vue';
import { UserService } from '../services/userService';
import type { User, UserProfile, UserSettings, UserUpdate } from '../types/userTypes';
import { useUserStore } from '../store/userStore';

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
      const user = await userService.getUserById(id);
      return user;
    } catch (err: any) {
      error.value = err.message || 'Failed to get user';
      console.error('Error getting user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Get user profile
   */
  async function getUserProfile(id: string): Promise<UserProfile | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const profile = await userService.getUserProfile(id);
      return profile;
    } catch (err: any) {
      error.value = err.message || 'Failed to get user profile';
      console.error('Error getting user profile:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Get user settings
   */
  async function getUserSettings(id: string): Promise<UserSettings | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const settings = await userService.getUserSettings(id);
      return settings;
    } catch (err: any) {
      error.value = err.message || 'Failed to get user settings';
      console.error('Error getting user settings:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Update a user
   */
  async function updateUser(id: string, userData: UserUpdate): Promise<User | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedUser = await userStore.updateUser(id, userData);
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
   * Update user profile
   */
  async function updateUserProfile(id: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedProfile = await userService.updateUserProfile(id, profileData);
      return updatedProfile;
    } catch (err: any) {
      error.value = err.message || 'Failed to update user profile';
      console.error('Error updating user profile:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Update user settings
   */
  async function updateUserSettings(id: string, settingsData: Partial<UserSettings>): Promise<UserSettings | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedSettings = await userService.updateUserSettings(id, settingsData);
      return updatedSettings;
    } catch (err: any) {
      error.value = err.message || 'Failed to update user settings';
      console.error('Error updating user settings:', err);
      return null;
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
    
    // Methods
    fetchCurrentUser,
    getUserById,
    getUserProfile,
    getUserSettings,
    updateUser,
    updateUserProfile,
    updateUserSettings
  };
}