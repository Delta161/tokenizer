import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

/**
 * Centralized API client using Axios
 * Configured with base URL, credentials, timeout, and interceptors
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true, // Important for cookies/sessions
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get auth token from Pinia store
    // Note: In a real implementation, you might need to handle the store initialization differently
    // since this runs before the Vue app is mounted
    try {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated && authStore.user?.token) {
        config.headers.Authorization = `Bearer ${authStore.user.token}`;
      }
    } catch (error) {
      // Fallback to localStorage if store isn't available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with an error status
      const { status } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        try {
          const authStore = useAuthStore();
          authStore.logout();
        } catch (e) {
          // Store not available
        }
        window.location.href = '/login';
      }
      
      // Log other errors
      console.error(
        `API Error: ${status}`,
        error.response.data?.message || 'Unknown error'
      );
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response received', error.request);
    } else {
      // Error in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;