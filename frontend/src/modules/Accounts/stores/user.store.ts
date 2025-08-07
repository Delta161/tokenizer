import { defineStore } from 'pinia';
import { userService } from '../services/user.service';
import type { User, UserProfile, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../types/user.types';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    users: [] as User[],
    usersList: null as UserListResponse | null,
    loading: false,
    adminLoading: false,
    error: null as string | null
  }),
  
  getters: {
    isAdmin: (state) => state.currentUser?.role === 'ADMIN',
    isClient: (state) => state.currentUser?.role === 'CLIENT', 
    isInvestor: (state) => state.currentUser?.role === 'INVESTOR',
    isAuthenticated: (state) => !!state.currentUser,
    getUserById: (state) => (id: string) => state.users.find(user => user.id === id),
    totalUsers: (state) => state.usersList?.total || 0,
    hasMoreUsers: (state) => state.usersList?.hasMore || false
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
      this.usersList = null;
      this.error = null;
    },

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    async fetchUsers(params?: { page?: number; limit?: number; role?: string }) {
      this.adminLoading = true;
      this.error = null;
      
      try {
        const response = await userService.getUsers(params);
        this.usersList = response;
        this.users = response.users;
        return response;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch users';
        console.error('Error fetching users:', error);
        throw error;
      } finally {
        this.adminLoading = false;
      }
    },

    async createUser(userData: CreateUserRequest) {
      this.adminLoading = true;
      this.error = null;
      
      try {
        const newUser = await userService.createUser(userData);
        this.users.push(newUser);
        if (this.usersList) {
          this.usersList.users.push(newUser);
          this.usersList.total += 1;
        }
        return newUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to create user';
        console.error('Error creating user:', error);
        throw error;
      } finally {
        this.adminLoading = false;
      }
    },

    async updateUser(userId: string, userData: UpdateUserRequest) {
      this.adminLoading = true;
      this.error = null;
      
      try {
        const updatedUser = await userService.updateUser(userId, userData);
        
        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex] = updatedUser;
        }
        
        // Update in usersList
        if (this.usersList) {
          const listUserIndex = this.usersList.users.findIndex(u => u.id === userId);
          if (listUserIndex !== -1) {
            this.usersList.users[listUserIndex] = updatedUser;
          }
        }
        
        // Update current user if it's the same user
        if (this.currentUser?.id === userId) {
          this.currentUser = updatedUser;
        }
        
        return updatedUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to update user';
        console.error('Error updating user:', error);
        throw error;
      } finally {
        this.adminLoading = false;
      }
    },

    async deleteUser(userId: string) {
      this.adminLoading = true;
      this.error = null;
      
      try {
        await userService.deleteUser(userId);
        
        // Remove from users array
        this.users = this.users.filter(u => u.id !== userId);
        
        // Remove from usersList
        if (this.usersList) {
          this.usersList.users = this.usersList.users.filter(u => u.id !== userId);
          this.usersList.total -= 1;
        }
        
        return true;
      } catch (error: any) {
        this.error = error.message || 'Failed to delete user';
        console.error('Error deleting user:', error);
        throw error;
      } finally {
        this.adminLoading = false;
      }
    },

    async getUserById(userId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const user = await userService.getUserById(userId);
        
        // Update the user in our arrays if it exists
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex] = user;
        } else {
          this.users.push(user);
        }
        
        return user;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch user';
        console.error('Error fetching user:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});