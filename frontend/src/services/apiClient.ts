// frontend/src/services/apiClient.ts
import axios from 'axios';
import router from '@/router';
import errorHandler from './errorHandler';

/**
 * Create an Axios instance with a base URL that points to your API.
 * Ensure VITE_API_BASE_URL includes the /api/v1 prefix.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Helper to clear local storage and redirect to login */
function clearAuthAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('user');
  router.push('/login');
}

/** Request interceptor: attach access token if present and valid */
apiClient.interceptors.request.use(
  (config) => {
    // Don’t attach tokens when hitting the refresh endpoint itself
    if (config.url?.includes('/auth/refresh')) return config;

    const token = localStorage.getItem('accessToken');
    const expiresAt = localStorage.getItem('tokenExpiresAt');

    if (token && (!expiresAt || Date.now() < parseInt(expiresAt))) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/** Response interceptor: handle 401/403 errors */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const status = response?.status;

    // If unauthorized and this was not a refresh attempt
    if (status === 401 && !config._retry && !config.url?.includes('/auth/refresh')) {
      config._retry = true;
      try {
        // Attempt to refresh the access token using the same apiClient
        const { data } = await apiClient.post('/auth/refresh');
        const newToken = data.accessToken;

        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          if (data.expiresAt) {
            localStorage.setItem('tokenExpiresAt', data.expiresAt.toString());
          }
          // Retry the original request with the new token
          config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(config);
        }
      } catch (refreshError) {
        // Refresh failed — fall through to clear auth
      }
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // If forbidden due to a session timeout
    if (
      status === 403 &&
      response?.data?.message &&
      typeof response.data.message === 'string' &&
      response.data.message.includes('session')
    ) {
      console.warn('Session timeout detected');
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // For other errors, delegate to a central handler and rethrow
    errorHandler.processError(error);
    return Promise.reject(error);
  }
);

export default apiClient;
