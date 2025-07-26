import { computed } from 'vue';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials, RegisterData } from '../types/authTypes';
import type { User } from '../types/userTypes';

/**
 * Composable for authentication functionality
 * Provides reactive access to auth state and methods
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Computed properties
  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isLoading = computed(() => authStore.loading);
  const error = computed(() => authStore.error);
  const userRole = computed(() => authStore.userRole);

  // Methods
  const login = async (credentials: LoginCredentials) => {
    return authStore.login(credentials);
  };

  const register = async (data: RegisterData) => {
    return authStore.register(data);
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
    login,
    register,
    logout,
    checkAuth,
    refreshToken,
    hasRole,
    hasAnyRole
  };
}