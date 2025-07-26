/**
 * Accounts Module Index
 * 
 * This module consolidates functionality from the Auth module and includes User functionality
 * to provide a unified interface for account management.
 */

import { defineAsyncComponent } from 'vue';

// Import from Auth module
import { useAuthStore } from '../Auth/store/authStore';
import { authRoutes } from '../Auth/views';
import * as AuthService from '../Auth/services';
import * as AuthTypes from '../Auth/types';
import * as AuthComposables from '../Auth/composables';

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
import { UserProfileCard, UserSettingsForm, UserAvatar, UserListItem, UserRoleBadge } from './components';


// Lazy-loaded components from Auth module
const LoginForm = defineAsyncComponent(() => import('../Auth/components/LoginForm.vue'));
const RegisterForm = defineAsyncComponent(() => import('../Auth/components/RegisterForm.vue'));
const ForgotPasswordForm = defineAsyncComponent(() => import('../Auth/components/ForgotPasswordForm.vue'));
const ResetPasswordForm = defineAsyncComponent(() => import('../Auth/components/ResetPasswordForm.vue'));
const OAuthButtons = defineAsyncComponent(() => import('../Auth/components/OAuthButtons.vue'));

/**
 * Initialize the Accounts module
 * This function consolidates the initialization of Auth and User modules
 */
export function initAccountsModule() {
  console.log('Accounts module initialized');
  
  // Initialize Auth module
  import('../Auth/store/authStore').then(({ useAuthStore }) => {
    const authStore = useAuthStore();
    authStore.initializeAuth();
  });
  
  // Initialize User functionality
console.log('User functionality initialized within Accounts module');
import('./store/userStore').then(({ useUserStore }) => {
  const userStore = useUserStore();
  userStore.fetchCurrentUser();
});
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
  AuthComposables,
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