import { defineStore } from 'pinia';
import { UserService } from '../services';
import type { User, UserUpdate, UserSearchParams, UserSearchResult } from '../types';

/**
 * User store
 * Manages user state and operations
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    currentUser: null as User | null,
    userSearchResult: null as UserSearchResult | null,
    loading: false,
    error: null as string | null
  }),
  
  getters: {
    /**
     * Get user by ID
     */
    getUserById: (state) => {
      return (userId: string) => state.users.find(user => user.id === userId);
    },
    
    /**
     * Get total number of users
     */
    totalUsers: (state) => {
      return state.userSearchResult?.total || 0;
    }
  },
  
  actions: {
    /**
     * Fetch current user profile
     */
    async fetchCurrentUser() {
      const userService = new UserService();
      this.loading = true;
      this.error = null;
      
      try {
        this.currentUser = await userService.getCurrentUser();
        return this.currentUser;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update current user profile
     */
    async updateCurrentUser(userData: UserUpdate) {
      const userService = new UserService();
      this.loading = true;
      this.error = null;
      
      try {
        if (!this.currentUser) {
          throw new Error('No current user found');
        }
        
        this.currentUser = await userService.updateUser(this.currentUser.id, userData);
        return this.currentUser;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Search users
     */
    async searchUsers(params: UserSearchParams) {
      const userService = new UserService();
      this.loading = true;
      this.error = null;
      
      try {
        this.userSearchResult = await userService.searchUsers(params);
        this.users = this.userSearchResult.users;
        return this.userSearchResult;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Get user by ID
     */
    async fetchUserById(userId: string) {
      const userService = new UserService();
      this.loading = true;
      this.error = null;
      
      try {
        const user = await userService.getUserById(userId);
        
        // Update users array if user not already in it
        const existingUserIndex = this.users.findIndex(u => u.id === userId);
        if (existingUserIndex >= 0) {
          this.users[existingUserIndex] = user;
        } else {
          this.users.push(user);
        }
        
        return user;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Clear user store state
     */
    clearState() {
      this.users = [];
      this.currentUser = null;
      this.userSearchResult = null;
      this.loading = false;
      this.error = null;
    }
  }
});