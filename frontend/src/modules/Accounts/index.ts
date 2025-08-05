/**
 * Accounts Module Index
 * 
 * This module consolidates functionality from the Auth module and includes User functionality
 * to provide a unified interface for account management.
 */

// Core functionality exports
export { useAuthStore } from './store/auth.store';
export { useUserStore } from './store/user.store';  
export { useKycStore } from './store/kyc.store';

export { accountsRoutes } from './routes';

export { useAuth } from './composables/useAuth';
export { useUser, useUserSearch } from './composables';
export { useKyc } from './composables/useKyc';

export * as AuthService from './services/auth.service';
export { UserService } from './services/user.service';
export { KycService } from './services/kyc.service';

// Type exports
export type { User, UserProfile, UserSettings, UserRole, UserUpdate, UserSearchParams, UserSearchResult } from './types/user.types';
export type { KycRecord, KycSubmissionData, KycProviderSession } from './types/kyc.types';
export { KycStatus, KycProvider } from './types/kyc.types';
export * as AuthTypes from './types/auth.types';

// Component exports
export { 
  UserComponent, 
  UserRoleBadge,
  AuthComponent,
  KycVerificationStatus
} from './components';

/**
 * Initialize the Accounts module
 */
export function initAccountsModule() {
  console.log('Accounts module initialized');
}