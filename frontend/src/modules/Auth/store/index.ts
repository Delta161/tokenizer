// Auth Module Store
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const token = ref<string | null>(null);
  
  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const userRole = computed(() => user.value?.role || 'guest');
  
  // Actions
  async function login(credentials: LoginCredentials) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await authService.login(credentials);
      user.value = response.user;
      token.value = response.token;
      return response;
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function register(data: RegisterData) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await authService.register(data);
      user.value = response.user;
      token.value = response.token;
      return response;
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function logout() {
    isLoading.value = true;
    
    try {
      await authService.logout();
      user.value = null;
      token.value = null;
    } catch (err: any) {
      error.value = err.message || 'Logout failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function checkAuth() {
    isLoading.value = true;
    
    try {
      const response = await authService.getCurrentUser();
      user.value = response.user;
      token.value = response.token;
      return response;
    } catch (err) {
      user.value = null;
      token.value = null;
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    // State
    user,
    isLoading,
    error,
    token,
    
    // Getters
    isAuthenticated,
    userRole,
    
    // Actions
    login,
    register,
    logout,
    checkAuth
  };
});