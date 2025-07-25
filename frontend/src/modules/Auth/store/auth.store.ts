import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/auth.service';
import { useRouter } from 'vue-router';

/**
 * Auth Store
 * Manages authentication state and actions
 */
export const useAuthStore = defineStore('auth', () => {
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
      // Call the auth service login method
      const response = await authService.login(credentials);
      
      // Update state with response data
      user.value = response.user;
      token.value = response.token;
      isAuthenticated.value = true;
      
      // Store token in localStorage for persistence
      localStorage.setItem('token', response.token);
      
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
      // Call the auth service register method
      const response = await authService.register(userData);
      
      // Update state with response data
      user.value = response.user;
      token.value = response.token;
      isAuthenticated.value = true;
      
      // Store token in localStorage for persistence
      localStorage.setItem('token', response.token);
      
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
      // Call the auth service logout method
      await authService.logout();
      
      // Clear state
      user.value = null;
      token.value = '';
      isAuthenticated.value = false;
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page
      const router = useRouter();
      router.push('/login');
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
      // Call the auth service getCurrentUser method
      const userData = await authService.getCurrentUser();
      
      // Update state with response data
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
      // Call the auth service requestPasswordReset method
      return await authService.requestPasswordReset(email);
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
      // Call the auth service resetPassword method
      return await authService.resetPassword(token, password);
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
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      isAuthenticated.value = true;
      // Fetch user data
      fetchCurrentUser().catch(() => {
        // If fetching fails, clear auth state
        logout();
      });
    }
  }

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
    initializeFromStorage
  };
});