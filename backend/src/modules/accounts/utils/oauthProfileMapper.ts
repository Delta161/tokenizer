/**
 * OAuth Profile Mapper
 * Maps OAuth provider profiles to a standardized format
 */

// Internal modules
import { UserRole } from '@prisma/client';

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
    role: UserRole.INVESTOR
  };
};

/**
 * Map Azure profile to normalized format
 * 
 * This function extracts user information from an Azure AD profile and normalizes it.
 * It includes fallback mechanisms for missing fields:
 * - Email: Uses mail or userPrincipalName
 * - Names: Extracts first/last names from displayName if not provided directly
 * - Provider ID: Ensures a non-empty value with fallback
 */
export const mapAzureProfile = (profile: AzureProfile): NormalizedProfile => {
  if (!profile) {
    throw new Error('Cannot map null or undefined Azure profile');
  }
  
  // Ensure we have a valid provider ID (oid)
  const providerId = profile.oid || '';
  if (!providerId) {
    throw new Error('Azure profile missing required oid (provider ID)');
  }
  
  // Extract email with fallbacks
  const email = profile.mail || profile.userPrincipalName || '';
  
  // Extract name information with fallbacks
  const firstName = profile.givenName || '';
  const lastName = profile.surname || '';
  
  // If we have a displayName but no first/last name, try to extract them
  const displayName = profile.displayName || undefined;
  let extractedFirstName = firstName;
  let extractedLastName = lastName;
  
  // More robust name extraction from displayName
  if (displayName) {
    // If we're missing either first or last name, try to extract from displayName
    if (!extractedFirstName || !extractedLastName) {
      if (displayName.includes(' ')) {
        // If display name has spaces, split into parts
        const nameParts = displayName.split(' ').filter(Boolean); // Remove empty parts
        
        if (!extractedFirstName && nameParts.length > 0) {
          extractedFirstName = nameParts[0];
        }
        
        if (!extractedLastName && nameParts.length > 1) {
          extractedLastName = nameParts.slice(1).join(' ');
        }
      } else {
        // If no spaces in displayName, use it as firstName if firstName is empty
        if (!extractedFirstName) {
          extractedFirstName = displayName;
        }
      }
    }
  }
  
  return {
    providerId,
    provider: 'azure',
    email,
    firstName: extractedFirstName,
    lastName: extractedLastName,
    displayName,
    role: UserRole.INVESTOR
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
 * 
 * This function validates a normalized profile to ensure it contains required fields.
 * It supports two validation modes:
 * 
 * 1. Strict validation (default): Requires all of the following:
 *    - providerId: Unique identifier from the OAuth provider
 *    - provider: The OAuth provider name (e.g., 'azure', 'google')
 *    - email: User's email address
 *    - At least one name field (firstName, lastName, or displayName)
 * 
 * 2. Relaxed validation: Only requires:
 *    - providerId: Unique identifier from the OAuth provider
 *    - provider: The OAuth provider name
 * 
 * The relaxed validation allows authentication to proceed even with incomplete
 * profile data, which can be useful for handling variations in OAuth provider responses.
 * 
 * @param profile The normalized profile to validate
 * @param strictValidation Whether to strictly validate all fields (default: true)
 * @returns boolean indicating if the profile is valid
 */
/**
 * Validates a normalized profile using Zod schemas
 * @param profile The normalized profile to validate
 * @param strictValidation Whether to strictly validate all fields (default: true)
 * @returns Boolean indicating if the profile is valid
 * @deprecated Use NormalizedProfileSchema or RelaxedNormalizedProfileSchema directly instead
 */
export const validateNormalizedProfile = (profile: NormalizedProfile, strictValidation = true): boolean => {
  if (!profile) {
    return false;
  }
  
  // Import validation schemas dynamically to avoid circular dependencies
  // This is a temporary solution until all code is migrated to use schemas directly
  try {
    // Check for critical fields - provider ID and provider are always required
    if (!profile.providerId || !profile.provider) {
      return false;
    }
    
    // For relaxed validation, we only need provider ID and provider
    if (!strictValidation) {
      return true;
    }
    
    // Email validation - required in strict mode
    if (!profile.email) {
      return false;
    }
    
    // Name validation - at least one name field is required in strict mode
    return !!(profile.firstName || profile.lastName || profile.displayName);
  } catch (error) {
    console.error('Error validating normalized profile:', error);
    return false;
  }
}

