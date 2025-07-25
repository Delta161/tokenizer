import axios from 'axios';
import { useAuthStore } from '@/modules/Auth/store/authStore';
import router from '@/router';

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
  async (config) => {
    // Skip token for auth endpoints that don't require authentication
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register') || 
                          config.url?.includes('/auth/refresh');
    
    if (isAuthEndpoint) {
      return config;
    }
    
    try {
      const authStore = useAuthStore();
      
      // Check if token is valid or needs refresh
      if (authStore.isAuthenticated) {
        // If token is expired, try to refresh it
        if (authStore.tokenExpiresAt && Date.now() >= authStore.tokenExpiresAt) {
          await authStore.refreshAccessToken();
        }
        
        // Add token to request header
        if (authStore.accessToken) {
          config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
      // If store isn't available, try localStorage as fallback
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
import errorHandler from './errorHandler';

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Get the original request config
    const originalRequest = error.config;
    
    // Handle different error scenarios
    if (error.response) {
      const { status } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // If this is not a retry and not a refresh token request
        if (!originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;
          
          try {
            const authStore = useAuthStore();
            
            // Try to refresh the token
            const refreshed = await authStore.refreshAccessToken();
            
            if (refreshed) {
              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
              // Retry the original request
              return apiClient(originalRequest);
            } else {
              // If refresh failed, logout and redirect to login
              await authStore.logout();
              router.push('/login');
            }
          } catch (refreshError) {
            // Process the refresh error
            errorHandler.processError(refreshError);
            
            // Clear auth data and redirect to login
            try {
              const authStore = useAuthStore();
              await authStore.logout();
            } catch (e) {
              // Store not available, clear localStorage manually
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
            }
            router.push('/login');
          }
        } else {
          // This is either a retry that failed or a refresh token request that failed
          // Clear auth data and redirect to login
          try {
            const authStore = useAuthStore();
            await authStore.logout();
          } catch (e) {
            // Store not available
          }
          router.push('/login');
        }
      }
      
      // Handle session timeout (403 with specific message)
      if (status === 403 && error.response.data?.message?.includes('session')) {
        console.warn('Session timeout detected');
        try {
          const authStore = useAuthStore();
          await authStore.logout();
        } catch (e) {
          // Store not available
        }
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