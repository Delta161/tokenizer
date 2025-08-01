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
import { UserService } from './services/userService';
import { useUser, useUserSearch } from './composables';
import type { User, UserProfile, UserSettings, UserRole, UserUpdate, UserSearchParams, UserSearchResult } from './types/userTypes';

// Import from KYC functionality
import { useKycStore } from './store/kycStore';
import { kycRoutes } from './views/kycRoutes';
import { KycService } from './services/kycService';
import { useKyc } from './composables/useKyc';
import type { KycRecord, KycSubmissionData, KycProviderSession } from './types/kycTypes';
import { KycStatus, KycProvider } from './types/kycTypes';

// Import data transformation mappers
import * as mappers from './utils/mappers';

// Re-export types for external use
export type { User, UserProfile, UserSettings, UserRole, UserUpdate, UserSearchParams, UserSearchResult };
export type { KycRecord, KycSubmissionData, KycProviderSession };
export { KycStatus, KycProvider };

// Re-export mappers for external use
export { mappers };

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
  UserSettingsForm, 
  UserAvatar, 
  UserListItem, 
  UserRoleBadge,
  OAuthButtons,
  AuthComponent, // Component part of auth view
  KycVerificationStatus
} from './components';

// Views from Accounts module
import {
  AuthView // View part that uses AuthComponent
} from './views';

// Note: UserProfileCard has been moved to sections/common/UserProfileSection.vue

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
  
  // Initialize KYC functionality
  console.log('KYC functionality initialized within Accounts module');
  const kycStore = useKycStore();
  kycStore.fetchKycRecord();
}

// Export consolidated components, services, and types
export {
  // Auth Components
  AuthComponent, // Component part of auth view
  AuthView, // View part that uses AuthComponent
  // LoginForm removed - only OAuth authentication is supported
  // RegisterForm removed - only OAuth authentication is supported
  OAuthButtons,
  
  // User Components
  // UserProfileCard moved to sections/common/UserProfileSection.vue
  UserSettingsForm,
  UserAvatar,
  UserListItem,
  UserRoleBadge,
  
  // KYC Components
  KycVerificationStatus,
  
  // Routes
  kycRoutes,
  
  // Stores
  useAuthStore,
  useUserStore,
  useKycStore,
  
  // Services
  AuthService,
  UserService,
  KycService,
  
  // Composables
  useAuth,
  useUser,
  useUserSearch,
  useKyc,
  
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