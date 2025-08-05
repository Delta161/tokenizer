/**
 * User Mapper
 * 
 * This file provides utility functions for mapping between backend and frontend user data structures.
 * It ensures consistent data transformation across the Accounts module.
 */

import type { User, UserProfile, UserSettings, UserRole, UserUpdate, UserSearchParams, UserSearchResult } from '../../types/user.types';
import type { RegisterData } from '../../types/auth.types';

/**
 * Map backend user to frontend user
 * @param backendUser Backend user data
 * @returns Frontend user object
 */
export function mapBackendUserToFrontend(backendUser: any): User {
  if (!backendUser) return null;

  // Handle the case where the backend returns fullName instead of firstName/lastName
  let firstName = backendUser.firstName;
  let lastName = backendUser.lastName;

  if ((!firstName || !lastName) && backendUser.fullName) {
    const nameParts = backendUser.fullName.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }

  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    role: backendUser.role,
    avatar: backendUser.avatarUrl || backendUser.avatar,
    createdAt: backendUser.createdAt ? new Date(backendUser.createdAt) : undefined,
    updatedAt: backendUser.updatedAt ? new Date(backendUser.updatedAt) : undefined,
    phone: backendUser.phone,
    preferredLanguage: backendUser.preferredLanguage,
    timezone: backendUser.timezone,
    authProvider: backendUser.authProvider
  };
}

/**
 * Map frontend user to backend user
 * @param frontendUser Frontend user data
 * @returns Backend user object
 */
export function mapFrontendUserToBackend(frontendUser: Partial<User>): any {
  if (!frontendUser) return null;
  
  // Compute fullName from firstName and lastName if both are provided
  const fullName = frontendUser.firstName && frontendUser.lastName
    ? `${frontendUser.firstName} ${frontendUser.lastName}`.trim()
    : frontendUser.fullName;

  return {
    ...frontendUser,
    fullName,
    avatarUrl: frontendUser.avatar,
    // Remove frontend-specific fields
    avatar: undefined,
    firstName: undefined,
    lastName: undefined
  };
}

/**
 * Map backend users array to frontend users array
 * @param backendUsers Array of backend user data
 * @returns Array of frontend user objects
 */
export function mapBackendUsersToFrontend(backendUsers: any[]): User[] {
  if (!backendUsers || !Array.isArray(backendUsers)) return [];
  return backendUsers.map(mapBackendUserToFrontend);
}

/**
 * Map frontend user profile to backend format
 * @param profile Frontend user profile
 * @returns Backend user profile object
 */
export function mapFrontendProfileToBackend(profile: UserProfile): any {
  if (!profile) return null;
  
  return {
    fullName: profile.firstName && profile.lastName 
      ? `${profile.firstName} ${profile.lastName}`.trim() 
      : undefined,
    phone: profile.phone,
    preferredLanguage: profile.preferredLanguage,
    timezone: profile.timezone
  };
}

/**
 * Map backend user profile to frontend format
 * @param backendProfile Backend user profile data
 * @returns Frontend user profile object
 */
export function mapBackendProfileToFrontend(backendProfile: any): UserProfile {
  if (!backendProfile) return null;
  
  let firstName = backendProfile.firstName;
  let lastName = backendProfile.lastName;

  if ((!firstName || !lastName) && backendProfile.fullName) {
    const nameParts = backendProfile.fullName.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }
  
  return {
    firstName,
    lastName,
    phone: backendProfile.phone,
    preferredLanguage: backendProfile.preferredLanguage,
    timezone: backendProfile.timezone
  };
}

/**
 * Map frontend user settings to backend format
 * @param settings Frontend user settings
 * @returns Backend user settings object
 */
export function mapFrontendSettingsToBackend(settings: UserSettings): any {
  if (!settings) return null;
  
  return {
    ...settings
    // Add any transformations needed for settings
  };
}

/**
 * Map backend user settings to frontend format
 * @param backendSettings Backend user settings data
 * @returns Frontend user settings object
 */
export function mapBackendSettingsToFrontend(backendSettings: any): UserSettings {
  if (!backendSettings) return null;
  
  return {
    ...backendSettings
    // Add any transformations needed for settings
  };
}

/**
 * Map frontend registration data to backend format
 * @param registerData Frontend registration data
 * @returns Backend registration data object
 * @deprecated Use OAuth authentication instead
 */
export function mapRegisterDataToBackend(registerData: RegisterData): any {
  if (!registerData) return null;
  
  return {
    email: registerData.email,
    // password field removed - only OAuth authentication is supported
    fullName: `${registerData.firstName} ${registerData.lastName}`.trim()
  };
}

/**
 * Map frontend user search params to backend format
 * @param searchParams Frontend search parameters
 * @returns Backend search parameters object
 */
export function mapSearchParamsToBackend(searchParams: UserSearchParams): any {
  if (!searchParams) return {};
  
  return {
    search: searchParams.query,
    role: searchParams.role,
    page: searchParams.page,
    limit: searchParams.limit,
    sortBy: searchParams.sortBy,
    sortDirection: searchParams.sortDirection
  };
}

/**
 * Map backend search result to frontend format
 * @param backendResult Backend search result data
 * @returns Frontend search result object
 */
export function mapBackendSearchResultToFrontend(backendResult: any): UserSearchResult {
  if (!backendResult) return { users: [], total: 0, page: 1, limit: 10 };
  
  return {
    users: mapBackendUsersToFrontend(backendResult.data || []),
    total: backendResult.total || 0,
    page: backendResult.page || 1,
    limit: backendResult.limit || 10
  };
}