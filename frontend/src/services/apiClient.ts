import axios from 'axios';
import router from '@/router';
import errorHandler from './errorHandler';

/**
 * Centralized API client using Axios
 * Configured for session-based authentication with HTTP-only cookies
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // Essential for session cookies
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - simplified for session-based auth
apiClient.interceptors.request.use(
  async (config) => {
    // No need to add Authorization headers - sessions use HTTP-only cookies
    // The browser automatically includes session cookies with requests
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status } = error.response;
      
      // Handle authentication errors (session expired/invalid)
      if (status === 401) {
        console.warn('Session expired or invalid');
        // Clear any cached user data and redirect to login
        localStorage.removeItem('user');
        router.push('/login');
      }
      
      // Handle session timeout (403 with specific message)
      if (status === 403 && error.response.data?.message?.includes('session')) {
        console.warn('Session timeout detected');
        localStorage.removeItem('user');
        router.push('/login');
      }
      
      // Process the error through our error handler
      errorHandler.processError(error);
    } else if (error.request) {
      // Request was made but no response received
      errorHandler.processError(error);
    } else {
      // Error in setting up the request
      errorHandler.processError(error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;