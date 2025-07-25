// This file is deprecated and will be removed in a future version.
// Please use authStore.ts instead.

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/auth.service';
import { useRouter } from 'vue-router';
import { useAuthStore as useNewAuthStore } from './authStore';

/**
 * Auth Store (Legacy)
 * This store is deprecated and will be removed in a future version.
 * Please use authStore.ts instead.
 */
export const useAuthStore = defineStore('auth-legacy', () => {
  // Get the new auth store
  const newAuthStore = useNewAuthStore();
  
  // State
  const user = ref(null);
  const token = ref('');
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const userFullName = computed(() => {
    if (!user.value) return '';
    return `${user.value.firstName} ${user.value.lastName}`;
  });

  // Actions
  async function login(credentials) {
    loading.value = true;
    error.value = null;

    try {
      // Use the new auth store login method
      const response = await newAuthStore.login(credentials);
      
      // Update legacy state with response data
      user.value = response.user;
      token.value = newAuthStore.accessToken;
      isAuthenticated.value = true;
      
      return response;
    } catch (err) {
      console.error('Login error:', err);
      error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(userData) {
    loading.value = true;
    error.value = null;

    try {
      // Use the new auth store register method
      const response = await newAuthStore.register(userData);
      
      // Update legacy state with response data
      user.value = response.user;
      token.value = newAuthStore.accessToken;
      isAuthenticated.value = true;
      
      return response;
    } catch (err) {
      console.error('Registration error:', err);
      error.value = err.response?.data?.message || 'Registration failed. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;

    try {
      // Use the new auth store logout method
      await newAuthStore.logout();
      
      // Clear legacy state
      user.value = null;
      token.value = '';
      isAuthenticated.value = false;
    } catch (err) {
      console.error('Logout error:', err);
      error.value = err.response?.data?.message || 'Logout failed. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser() {
    loading.value = true;
    error.value = null;

    try {
      // Use the new auth store getCurrentUser method
      const userData = await newAuthStore.getCurrentUser();
      
      // Update legacy state with response data
      user.value = userData;
      isAuthenticated.value = true;
      
      return userData;
    } catch (err) {
      console.error('Fetch current user error:', err);
      error.value = err.response?.data?.message || 'Failed to fetch user profile. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function requestPasswordReset(email) {
    loading.value = true;
    error.value = null;

    try {
      // Use the new auth store requestPasswordReset method
      return await newAuthStore.requestPasswordReset(email);
    } catch (err) {
      console.error('Password reset request error:', err);
      error.value = err.response?.data?.message || 'Failed to request password reset. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(token, password) {
    loading.value = true;
    error.value = null;

    try {
      // Use the new auth store resetPassword method
      return await newAuthStore.resetPassword(token, password);
    } catch (err) {
      console.error('Password reset error:', err);
      error.value = err.response?.data?.message || 'Failed to reset password. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Initialize from localStorage if token exists
  function initializeFromStorage() {
    // Use the new auth store initializeAuth method
    newAuthStore.initializeAuth();
    
    // Update legacy state
    if (newAuthStore.isAuthenticated) {
      user.value = newAuthStore.user;
      token.value = newAuthStore.accessToken;
      isAuthenticated.value = true;
    }
  }

  // Initialize the store
  initializeFromStorage();

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    
    // Getters
    userFullName,
    
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    requestPasswordReset,
    resetPassword,
    initializeFromStorage,
    
    // Alias to new store methods for compatibility
    checkAuth: () => newAuthStore.checkTokenValidity(),
    refreshToken: () => newAuthStore.refreshAccessToken()
  };
});