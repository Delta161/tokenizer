import { defineAsyncComponent } from 'vue';

// Import components
import { userRoutes } from './views';
import { useUserStore } from './store';
import { UserService } from './services';
import { useUser, useUserSearch } from './composables';
import type { User, UserProfile, UserSettings, UserRole, UserUpdate, UserSearchParams, UserSearchResult } from './types';

// Lazy-loaded components
const UserProfileCard = defineAsyncComponent(() => import('./components/UserProfileCard.vue'));
const UserSettingsForm = defineAsyncComponent(() => import('./components/UserSettingsForm.vue'));
const UserAvatar = defineAsyncComponent(() => import('./components/UserAvatar.vue'));
const UserListItem = defineAsyncComponent(() => import('./components/UserListItem.vue'));
const UserRoleBadge = defineAsyncComponent(() => import('./components/UserRoleBadge.vue'));

/**
 * Initialize the User module
 * This function should be called when the application starts
 */
export function initUserModule() {
  // Initialize any module-specific logic here
  console.log('User module initialized');
}

// Export module components, services, and types
export {
  // Components
  UserProfileCard,
  UserSettingsForm,
  UserAvatar,
  UserListItem,
  UserRoleBadge,
  
  // Routes
  userRoutes,
  
  // Store
  useUserStore,
  
  // Services
  UserService,
  
  // Composables
  useUser,
  useUserSearch,
  
  // Types
  User,
  UserProfile,
  UserSettings,
  UserRole,
  UserUpdate,
  UserSearchParams,
  UserSearchResult
};