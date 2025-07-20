/**
 * OAuth Profile Mapper
 * Maps OAuth provider profiles to a standardized format
 */
/**
 * Map Google OAuth profile to normalized profile
 */
export const mapGoogleProfile = (profile) => {
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
export const mapAzureProfile = (profile) => {
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
export const mapOAuthProfile = (profile, provider) => {
    switch (provider) {
        case 'google':
            return mapGoogleProfile(profile);
        case 'azure-ad':
            return mapAzureProfile(profile);
        default:
            throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
};
/**
 * Validate normalized profile
 * Ensures all required fields are present
 */
export const validateNormalizedProfile = (profile) => {
    if (!profile.providerId || !profile.provider || !profile.email) {
        return false;
    }
    // At least one name field should be present
    if (!profile.firstName && !profile.lastName && !profile.displayName) {
        return false;
    }
    return true;
};
//# sourceMappingURL=oauthProfileMapper.js.map