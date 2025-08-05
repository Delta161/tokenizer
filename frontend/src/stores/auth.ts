import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../modules/Accounts/types/user.types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);

  // Computed property for user role
  const userRole = computed(() => user.value?.role || 'user');

  async function login(credentials: { email: string; password: string }) {
    // API call stub
    // const response = await api.post('/auth/login', credentials);
    // user.value = response.data.user;
    isAuthenticated.value = true;
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Initialize auth from localStorage
   */
  function initializeAuth() {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      isAuthenticated.value = true;
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
        } catch (e) {
          console.warn('Failed to parse stored user data');
        }
      }
    }
  }

  /**
   * Check if the current token is valid
   */
  async function checkTokenValidity(): Promise<boolean> {
    const token = localStorage.getItem('accessToken');
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    if (expiresAt && Date.now() >= parseInt(expiresAt)) {
      return false;
    }
    
    // For development, accept the dev token
    if (token === 'dev-test-token-12345') {
      return true;
    }
    
    // For real tokens, you would validate with the server
    // For now, assume valid if it exists and hasn't expired
    return true;
  }

  return { 
    user, 
    isAuthenticated, 
    userRole,
    login, 
    logout, 
    initializeAuth, 
    checkTokenValidity 
  };
});