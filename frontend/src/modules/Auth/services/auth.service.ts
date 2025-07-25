import apiClient from '@/services/apiClient';

/**
 * Auth Service
 * Handles all API calls related to authentication
 */
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
  };
  token: string;
}

const authService = {
  /**
   * Login user with email and password
   * @param credentials - User login credentials
   * @returns Promise with user data and token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise with user data and token
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout current user
   * @returns Promise with success message
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise with success message
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/password-reset-request', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param token - Reset token
   * @param password - New password
   * @returns Promise with success message
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/password-reset', { token, password });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};

export default authService;