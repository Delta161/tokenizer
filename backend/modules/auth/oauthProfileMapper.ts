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
  emails: Array<{ value: string; verified?: boolean }>;
  displayName: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  photos?: Array<{ value: string }>;
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
export const mapGoogleProfile = (profile: any): NormalizedProfile => {
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
export const mapAzureProfile = (profile: AzureProfile): NormalizedProfile => {
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
export const mapOAuthProfile = (profile: any): NormalizedProfile => {
  switch (profile.provider) {
    case 'google':
      return mapGoogleProfile(profile as GoogleProfile);
    case 'azure-ad':
    case 'azure':
      return mapAzureProfile(profile as AzureProfile);
    default:
      throw new Error(`Unsupported OAuth provider: ${profile.provider}`);
  }
};

/**
 * Validate normalized profile data
 */
export const validateNormalizedProfile = (profile: NormalizedProfile): void => {
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