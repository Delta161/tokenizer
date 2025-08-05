import { defineStore } from 'pinia';
import { userService } from '../services/user.service';
import type { User, UserProfile } from '../types/user.types';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    users: [] as User[],
    loading: false,
    error: null as string | null
  }),
  
  getters: {
    isAdmin: (state) => state.currentUser?.role === 'ADMIN',
    isClient: (state) => state.currentUser?.role === 'CLIENT', 
    isInvestor: (state) => state.currentUser?.role === 'INVESTOR',
    isAuthenticated: (state) => !!state.currentUser,
    getUserById: (state) => (id: string) => state.users.find(user => user.id === id)
  },
  
  actions: {
    async fetchCurrentUser() {
      this.loading = true;
      this.error = null;
      
      try {
        const user = await userService.getCurrentUser();
        this.currentUser = user;
        return user;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch current user';
        console.error('Error fetching current user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserProfile() {
      this.loading = true;
      this.error = null;
      
      try {
        const user = await userService.getUserProfile();
        this.currentUser = user;
        return user;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch user profile';
        console.error('Error fetching user profile:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateCurrentUser(userData: Partial<UserProfile>) {
      this.loading = true;
      this.error = null;
      
      try {
        const updatedUser = await userService.updateCurrentUser(userData);
        this.currentUser = updatedUser;
        return updatedUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to update current user';
        console.error('Error updating current user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUserProfile(profileData: Partial<UserProfile>) {
      this.loading = true;
      this.error = null;
      
      try {
        const updatedUser = await userService.updateUserProfile(profileData);
        this.currentUser = updatedUser;
        return updatedUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to update user profile';
        console.error('Error updating user profile:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearUser() {
      this.currentUser = null;
      this.users = [];
      this.error = null;
    }
  }
});