/**
 * User Mapper Utility
 * Handles mapping between backend and frontend user models
 */

import type { User, UserProfile } from '../types';

/**
 * Maps a backend user object to the frontend User model
 * Handles the conversion from fullName to firstName/lastName
 */
export const mapBackendUserToFrontend = (backendUser: any): User => {
  // Extract first and last name from fullName
  const nameParts = backendUser.fullName ? backendUser.fullName.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  // Create the frontend user object
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName,
    lastName,
    role: backendUser.role,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    profile: backendUser.profile as UserProfile,
    settings: backendUser.settings
  };
};

/**
 * Maps a frontend user object to the backend format
 * Combines firstName and lastName into fullName
 */
export const mapFrontendUserToBackend = (frontendUser: User): any => {
  // Combine firstName and lastName into fullName
  const fullName = [frontendUser.firstName, frontendUser.lastName]
    .filter(Boolean)
    .join(' ');
  
  // Create the backend user object
  return {
    id: frontendUser.id,
    email: frontendUser.email,
    fullName,
    role: frontendUser.role,
    profile: frontendUser.profile,
    settings: frontendUser.settings
  };
};

/**
 * Maps an array of backend users to frontend format
 */
export const mapBackendUsersToFrontend = (backendUsers: any[]): User[] => {
  return backendUsers.map(mapBackendUserToFrontend);
};