/**
 * OAuth Profile Mapper
 * Maps OAuth provider profiles to a standardized format
 */

import { UserRole } from './auth.types';

/**
 * Normalized OAuth profile interface
 */
export interface NormalizedProfile {
  providerId: string;
  provider: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role?: UserRole;
}

/**
 * Google OAuth profile interface
 */
export interface GoogleProfile {
  id: string;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  provider: string;
}

/**
 * Azure AD OAuth profile interface
 */
export interface AzureProfile {
  oid: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName?: string;
  provider: string;
}

/**
 * Map Google OAuth profile to normalized profile
 */
export const mapGoogleProfile = (profile: GoogleProfile): NormalizedProfile => {
  const email = profile.emails?.[0]?.value || '';
  const firstName = profile.name?.givenName || '';
  const lastName = profile.name?.familyName || '';
  const avatarUrl = profile.photos?.[0]?.value;
  
  return {
    providerId: profile.id,
    provider: 'google',
    email,
    firstName,
    lastName,
    displayName: profile.displayName,
    avatarUrl,
    role: UserRole.USER
  };
};

/**
 * Map Azure AD OAuth profile to normalized profile
 */
export const mapAzureProfile = (profile: AzureProfile): NormalizedProfile => {
  const email = profile.mail || profile.userPrincipalName || '';
  const firstName = profile.givenName || '';
  const lastName = profile.surname || '';
  
  return {
    providerId: profile.oid,
    provider: 'azure',
    email,
    firstName,
    lastName,
    displayName: profile.displayName,
    role: UserRole.USER
  };
};

/**
 * Map generic OAuth profile to normalized profile
 */
export const mapOAuthProfile = (profile: any, provider: string): NormalizedProfile => {
  switch (provider) {
    case 'google':
      return mapGoogleProfile(profile as GoogleProfile);
    case 'azure-ad':
      return mapAzureProfile(profile as AzureProfile);
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};

/**
 * Validate normalized profile
 * Ensures all required fields are present
 */
export const validateNormalizedProfile = (profile: NormalizedProfile): boolean => {
  if (!profile.providerId || !profile.provider || !profile.email) {
    return false;
  }
  
  // At least one name field should be present
  if (!profile.firstName && !profile.lastName && !profile.displayName) {
    return false;
  }
  
  return true;
};