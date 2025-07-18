/**
 * Normalized user profile interface
 */
export interface NormalizedProfile {
    email: string;
    fullName: string;
    avatarUrl?: string;
    provider: string;
    providerId: string;
}
/**
 * Google OAuth profile structure
 */
export interface GoogleProfile {
    id: string;
    emails: Array<{
        value: string;
        verified?: boolean;
    }>;
    displayName: string;
    name?: {
        givenName?: string;
        familyName?: string;
    };
    photos?: Array<{
        value: string;
    }>;
    provider: string;
}
/**
 * Azure AD OAuth profile structure
 */
export interface AzureProfile {
    oid: string;
    upn?: string;
    email?: string;
    displayName?: string;
    name?: {
        givenName?: string;
        familyName?: string;
    };
    _json?: {
        email?: string;
        name?: string;
        picture?: string;
    };
    provider: string;
}
/**
 * Map Google OAuth profile to normalized format
 */
export declare const mapGoogleProfile: (profile: any) => NormalizedProfile;
/**
 * Map Azure AD OAuth profile to normalized format
 */
export declare const mapAzureProfile: (profile: AzureProfile) => NormalizedProfile;
/**
 * Generic profile mapper that routes to appropriate provider mapper
 */
export declare const mapOAuthProfile: (profile: any) => NormalizedProfile;
/**
 * Validate normalized profile data
 */
export declare const validateNormalizedProfile: (profile: NormalizedProfile) => void;
//# sourceMappingURL=oauthProfileMapper.d.ts.map