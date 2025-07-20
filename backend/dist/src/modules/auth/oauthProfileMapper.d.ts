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
    emails?: Array<{
        value: string;
        verified?: boolean;
    }>;
    photos?: Array<{
        value: string;
    }>;
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
export declare const mapGoogleProfile: (profile: GoogleProfile) => NormalizedProfile;
/**
 * Map Azure AD OAuth profile to normalized profile
 */
export declare const mapAzureProfile: (profile: AzureProfile) => NormalizedProfile;
/**
 * Map generic OAuth profile to normalized profile
 */
export declare const mapOAuthProfile: (profile: any, provider: string) => NormalizedProfile;
/**
 * Validate normalized profile
 * Ensures all required fields are present
 */
export declare const validateNormalizedProfile: (profile: NormalizedProfile) => boolean;
//# sourceMappingURL=oauthProfileMapper.d.ts.map