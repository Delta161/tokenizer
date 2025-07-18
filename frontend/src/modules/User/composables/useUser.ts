import { computed, ref } from 'vue';
import { useUserStore } from '../store';
import type { User, UserUpdate } from '../types';

/**
 * Composable for user functionality
 * Provides reactive access to user state and methods
 */
export function useUser() {
  const userStore = useUserStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed properties
  const currentUser = computed(() => userStore.currentUser);
  
  /**
   * Fetch current user profile
   */
  const fetchCurrentUser = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await userStore.fetchCurrentUser();
      return currentUser.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update current user profile
   */
  const updateCurrentUser = async (userData: UserUpdate) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await userStore.updateCurrentUser(userData);
      return currentUser.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get user by ID
   */
  const getUserById = async (userId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await userStore.fetchUserById(userId);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get user's full name
   */
  const getFullName = (user: User) => {
    return `${user.firstName} ${user.lastName}`;
  };
  
  /**
   * Get user's initials for avatar
   */
  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };
  
  return {
    // State
    currentUser,
    isLoading,
    error,
    
    // Methods
    fetchCurrentUser,
    updateCurrentUser,
    getUserById,
    getFullName,
    getUserInitials
  };
}