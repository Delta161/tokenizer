/**
 * Accounts Module Index
 * 
 * This module consolidates functionality from the Auth module and includes User functionality
 * to provide a unified interface for account management.
 */

import { defineAsyncComponent } from 'vue';

// Import from Auth functionality (now part of Accounts)
import { useAuthStore } from './store/authStore';
import { authRoutes } from './views';
import * as AuthService from './services/authService';
import * as AuthTypes from './types/authTypes';
import { useAuth } from './composables/useAuth';

// Import from User functionality (now part of Accounts)
import { useUserStore } from './store/userStore';
import { userRoutes } from './views/userRoutes';
import { UserService } from './services/userService';
import { useUser, useUserSearch } from './composables';
import type { User, UserProfile, UserSettings, UserRole, UserUpdate, UserSearchParams, UserSearchResult } from './types/userTypes';

// Re-export types for external use
export type { User, UserProfile, UserSettings, UserRole, UserUpdate, UserSearchParams, UserSearchResult };

// Create a User namespace for backward compatibility
export namespace User {
  export function fromData(data: User): User {
    return {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName,
      role: data.role,
      avatar: data.avatar,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
}

// Components from Accounts module
import { 
  UserProfileCard, 
  UserSettingsForm, 
  UserAvatar, 
  UserListItem, 
  UserRoleBadge,
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  OAuthButtons
} from './components';

/**
 * Initialize the Accounts module
 * This function consolidates the initialization of Auth and User modules
 */
export function initAccountsModule() {
  console.log('Accounts module initialized');
  
  // Initialize Auth functionality
  const authStore = useAuthStore();
  authStore.initializeAuth();
  
  // Initialize User functionality
  console.log('User functionality initialized within Accounts module');
  const userStore = useUserStore();
  userStore.fetchCurrentUser();
}

// Export consolidated components, services, and types
export {
  // Auth Components
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  OAuthButtons,
  
  // User Components
  UserProfileCard,
  UserSettingsForm,
  UserAvatar,
  UserListItem,
  UserRoleBadge,
  
  // Routes
  authRoutes,
  userRoutes,
  
  // Stores
  useAuthStore,
  useUserStore,
  
  // Services
  AuthService,
  UserService,
  
  // Composables
  useAuth,
  useUser,
  useUserSearch,
  
  // Types
  AuthTypes,
  // User namespace is already exported above
  // Re-export types as values for backward compatibility
  UserProfile,
  UserSettings,
  UserRole,
  UserUpdate,
  UserSearchParams,
  UserSearchResult
};