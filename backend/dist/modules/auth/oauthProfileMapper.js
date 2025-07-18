/**
 * Map Google OAuth profile to normalized format
 */
export const mapGoogleProfile = (profile) => {
    const email = profile.emails?.[0]?.value;
    if (!email) {
        throw new Error('Email not provided by Google OAuth');
    }
    return {
        email,
        fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
        avatarUrl: profile.photos?.[0]?.value,
        provider: 'google',
        providerId: profile.id
    };
};
/**
 * Map Azure AD OAuth profile to normalized format
 */
export const mapAzureProfile = (profile) => {
    // Azure AD can provide email in multiple ways
    const email = profile.upn || profile.email || profile._json?.email;
    if (!email) {
        throw new Error('Email not provided by Azure AD OAuth');
    }
    // Construct full name from available data
    let fullName = profile.displayName || profile._json?.name;
    if (!fullName && profile.name) {
        fullName = `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim();
    }
    if (!fullName) {
        fullName = email.split('@')[0]; // Fallback to email username
    }
    return {
        email,
        fullName,
        avatarUrl: profile._json?.picture,
        provider: 'azure',
        providerId: profile.oid
    };
};
/**
 * Generic profile mapper that routes to appropriate provider mapper
 */
export const mapOAuthProfile = (profile) => {
    switch (profile.provider) {
        case 'google':
            return mapGoogleProfile(profile);
        case 'azure-ad':
        case 'azure':
            return mapAzureProfile(profile);
        default:
            throw new Error(`Unsupported OAuth provider: ${profile.provider}`);
    }
};
/**
 * Validate normalized profile data
 */
export const validateNormalizedProfile = (profile) => {
    if (!profile.email || !profile.email.includes('@')) {
        throw new Error('Invalid email address');
    }
    if (!profile.fullName || profile.fullName.trim().length === 0) {
        throw new Error('Full name is required');
    }
    if (!profile.provider || !profile.providerId) {
        throw new Error('Provider information is required');
    }
};
//# sourceMappingURL=oauthProfileMapper.js.map