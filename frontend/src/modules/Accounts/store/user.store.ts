import { defineStore } from 'pinia';
import { UserService } from '../services/user.service';
import type { User, UserUpdate } from '../types/user.types';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    users: [] as User[],
    loading: false,
    error: null as string | null
  }),
  
  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isAuthenticated: (state) => !!state.currentUser,
    getUserById: (state) => (id: string) => state.users.find(user => user.id === id)
  },
  
  actions: {
    async fetchCurrentUser() {
      this.loading = true;
      this.error = null;
      
      try {
        const userService = new UserService();
        const user = await userService.getCurrentUser();
        this.currentUser = user;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch current user';
        console.error('Error fetching current user:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async updateUser(userId: string, userData: UserUpdate) {
      this.loading = true;
      this.error = null;
      
      try {
        const userService = new UserService();
        const updatedUser = await userService.updateUser(userId, userData);
        
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser = updatedUser;
        }
        
        // Update user in users array if it exists
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        
        return updatedUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to update user';
        console.error('Error updating user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const userService = new UserService();
        const users = await userService.getAllUsers();
        this.users = users;
        return users;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch users';
        console.error('Error fetching users:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});