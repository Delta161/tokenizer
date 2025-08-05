import { computed } from 'vue';
import { useAuthStore } from '../store/auth.store';
import type { User } from '../types/user.types';

/**
 * Composable for authentication functionality
 * Provides reactive access to auth state and methods
 * Note: Only OAuth authentication is supported
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Computed properties
  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isLoading = computed(() => authStore.loading);
  const error = computed(() => authStore.error);
  const userRole = computed(() => authStore.userRole);

  // Methods - Password-based authentication removed
  // These methods are kept for API compatibility but will throw errors
  const login = async () => {
    return authStore.login();
  };

  const register = async () => {
    return authStore.register();
  };

  const logout = async () => {
    return authStore.logout();
  };

  const checkAuth = async () => {
    return authStore.checkTokenValidity();
  };

  const refreshToken = async () => {
    return authStore.refreshAccessToken();
  };

  /**
   * Check if the current user has the required role
   * @param requiredRole - The role to check against
   * @returns boolean indicating if user has the required role
   */
  const hasRole = (requiredRole: string) => {
    if (!isAuthenticated.value) return false;
    return userRole.value === requiredRole;
  };

  /**
   * Check if the current user has any of the required roles
   * @param requiredRoles - Array of roles to check against
   * @returns boolean indicating if user has any of the required roles
   */
  const hasAnyRole = (requiredRoles: string[]) => {
    if (!isAuthenticated.value) return false;
    return requiredRoles.includes(userRole.value);
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    userRole,
    
    // Methods
    login, // Note: Only works with OAuth authentication
    register, // Note: Only works with OAuth authentication
    logout,
    checkAuth,
    refreshToken,
    hasRole,
    hasAnyRole
  };
}