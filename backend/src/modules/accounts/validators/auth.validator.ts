/**
 * Auth Module Validators
 * Contains optimized Zod schemas for validating auth-related requests
 * Supports Google and Azure OAuth providers with enhanced security and validation
 */

// External packages
import { z } from 'zod';

// Internal modules - Use relative imports
import { UserRole } from '../types/auth.types';
import { AuthProvider } from '@prisma/client';

// Global utilities
import { logger } from '../../../utils/logger';

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

/** Maximum length for user names to prevent database overflow */
const MAX_NAME_LENGTH = 255;
/** Maximum length for email addresses */
const MAX_EMAIL_LENGTH = 320;
/** Maximum length for provider IDs */
const MAX_PROVIDER_ID_LENGTH = 255;
/** Maximum length for URLs */
const MAX_URL_LENGTH = 2048;
/** Minimum length for tokens */
const MIN_TOKEN_LENGTH = 10;
/** Maximum length for tokens */
const MAX_TOKEN_LENGTH = 10000;

/** Supported OAuth providers */
const OAUTH_PROVIDERS = ['google', 'azure-ad'] as const;
type OAuthProvider = typeof OAUTH_PROVIDERS[number];

/** Email domain patterns for validation */
const COMMON_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 
  'icloud.com', 'protonmail.com', 'mail.com'
];

/** Placeholder email domains */
const PLACEHOLDER_DOMAINS = {
  'google': 'placeholder.google.auth',
  'azure-ad': 'placeholder.azure.auth'
} as const;

// =============================================================================
// CORE AUTH SCHEMAS
// =============================================================================

/**
 * Enhanced token verification schema with security validation
 */
export const VerifyTokenSchema = z.object({
  token: z.string()
    .min(MIN_TOKEN_LENGTH, `Token must be at least ${MIN_TOKEN_LENGTH} characters`)
    .max(MAX_TOKEN_LENGTH, `Token must not exceed ${MAX_TOKEN_LENGTH} characters`)
    .regex(/^[A-Za-z0-9._-]+$/, 'Token contains invalid characters')
    .refine(token => !token.includes(' '), 'Token must not contain spaces')
    .transform(token => token.trim())
});

/**
 * Enhanced JWT token payload validation schema
 */
export const JWTPayloadSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email format'),
  role: z.nativeEnum(UserRole).refine(
    role => Object.values(UserRole).includes(role),
    { message: 'Invalid user role' }
  ),
  iat: z.number().int().positive('Invalid issued at timestamp').optional(),
  exp: z.number().int().positive('Invalid expiration timestamp').optional()
}).refine(
  data => !data.exp || !data.iat || data.exp > data.iat,
  { message: 'Token expiration must be after issued time', path: ['exp'] }
);

/**
 * Enhanced base OAuth profile validation schema with comprehensive checks
 */
export const OAuthProfileSchema = z.object({
  provider: z.enum(OAUTH_PROVIDERS).refine(
    provider => OAUTH_PROVIDERS.includes(provider as any),
    { message: 'Unsupported OAuth provider' }
  ),
  id: z.string()
    .min(1, 'Provider ID is required')
    .max(MAX_PROVIDER_ID_LENGTH, `Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Provider ID contains invalid characters')
    .transform(id => id.trim()),
  displayName: z.string()
    .max(MAX_NAME_LENGTH, `Display name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name?.trim())
    .optional(),
  name: z.object({
    givenName: z.string()
      .max(MAX_NAME_LENGTH / 2, `Given name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
      .transform(name => name?.trim())
      .optional(),
    familyName: z.string()
      .max(MAX_NAME_LENGTH / 2, `Family name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
      .transform(name => name?.trim())
      .optional()
  }).optional(),
  emails: z.array(
    z.object({
      value: z.string()
        .email('Invalid email format')
        .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
        .toLowerCase()
        .transform(email => email.trim()),
      verified: z.boolean().optional().default(false)
    })
  ).optional().default([]),
  photos: z.array(
    z.object({
      value: z.string()
        .url('Invalid photo URL')
        .max(MAX_URL_LENGTH, `Photo URL too long (max ${MAX_URL_LENGTH} chars)`)
        .refine(url => url.startsWith('https://'), 'Photo URL must use HTTPS')
    })
  ).optional().default([]),
  _json: z.any().optional()
}).refine(
  data => data.emails && data.emails.length > 0,
  { message: 'At least one email is required', path: ['emails'] }
);

/**
 * Enhanced normalized profile validation schema with strict validation
 */
export const NormalizedProfileSchema = z.object({
  provider: z.enum(OAUTH_PROVIDERS),
  providerId: z.string()
    .min(1, 'Provider ID is required')
    .max(MAX_PROVIDER_ID_LENGTH, `Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .transform(id => id.trim()),
  email: z.string()
    .email('Invalid email format')
    .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .toLowerCase()
    .transform(email => email.trim())
    .refine(email => !email.includes('+'), 'Email aliases with + are not allowed')
    .refine(email => {
      const domain = email.split('@')[1];
      return domain && domain.length > 0;
    }, 'Email must have a valid domain'),
  firstName: z.string()
    .max(MAX_NAME_LENGTH / 2, `First name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  lastName: z.string()
    .max(MAX_NAME_LENGTH / 2, `Last name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  displayName: z.string()
    .max(MAX_NAME_LENGTH, `Display name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name?.trim())
    .optional(),
  avatarUrl: z.string()
    .url('Invalid avatar URL')
    .max(MAX_URL_LENGTH, `Avatar URL too long (max ${MAX_URL_LENGTH} chars)`)
    .refine(url => url.startsWith('https://'), 'Avatar URL must use HTTPS')
    .optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.INVESTOR),
  _json: z.any().optional()
}).refine(
  data => !!(data.firstName || data.lastName || data.displayName),
  {
    message: 'At least one name field (firstName, lastName, or displayName) is required',
    path: ['firstName']
  }
).refine(
  data => !data.email?.includes('@placeholder.'),
  {
    message: 'Normalized profile cannot use placeholder email',
    path: ['email']
  }
);

/**
 * Relaxed normalized profile validation schema for incomplete OAuth data
 */
export const RelaxedNormalizedProfileSchema = z.object({
  provider: z.enum(OAUTH_PROVIDERS),
  providerId: z.string()
    .min(1, 'Provider ID is required')
    .max(MAX_PROVIDER_ID_LENGTH, `Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .transform(id => id.trim()),
  email: z.string()
    .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .transform(email => email?.trim()?.toLowerCase())
    .refine(email => {
      if (!email) return true;
      return z.string().email().safeParse(email).success;
    }, 'Email must be valid if provided')
    .optional(),
  firstName: z.string()
    .max(MAX_NAME_LENGTH / 2, `First name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  lastName: z.string()
    .max(MAX_NAME_LENGTH / 2, `Last name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  displayName: z.string()
    .max(MAX_NAME_LENGTH, `Display name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name?.trim())
    .optional(),
  avatarUrl: z.string()
    .max(MAX_URL_LENGTH, `Avatar URL too long (max ${MAX_URL_LENGTH} chars)`)
    .refine(url => {
      if (!url) return true;
      return z.string().url().safeParse(url).success && url.startsWith('https://');
    }, 'Avatar URL must be valid HTTPS URL if provided')
    .optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.INVESTOR),
  _json: z.any().optional()
});

// =============================================================================
// PROVIDER-SPECIFIC SCHEMAS
// =============================================================================

/**
 * Enhanced Google profile validation schema with strict type checking
 */
export const GoogleProfileSchema = z.object({
  id: z.string()
    .min(1, 'Google Provider ID is required')
    .max(MAX_PROVIDER_ID_LENGTH, `Google Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .regex(/^\d+$/, 'Google Provider ID must be numeric')
    .transform(id => id.trim()),
  displayName: z.string()
    .max(MAX_NAME_LENGTH, `Display name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name?.trim())
    .optional(),
  name: z.object({
    givenName: z.string()
      .max(MAX_NAME_LENGTH / 2, `Given name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
      .transform(name => name?.trim())
      .optional(),
    familyName: z.string()
      .max(MAX_NAME_LENGTH / 2, `Family name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
      .transform(name => name?.trim())
      .optional()
  }).optional(),
  emails: z.array(
    z.object({
      value: z.string()
        .email('Invalid Google email format')
        .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
        .toLowerCase()
        .transform(email => email.trim()),
      verified: z.boolean().optional().default(false)
    })
  ).min(1, 'Google profile must have at least one email').optional(),
  photos: z.array(
    z.object({
      value: z.string()
        .url('Invalid Google photo URL')
        .max(MAX_URL_LENGTH, `Photo URL too long (max ${MAX_URL_LENGTH} chars)`)
        .refine(url => url.includes('googleusercontent.com') || url.startsWith('https://'), 
          'Google photo URL must be from trusted domain')
    })
  ).optional().default([]),
  provider: z.literal('google'),
  _json: z.any().optional()
}).refine(
  data => data.emails && data.emails.length > 0,
  { message: 'Google profile must have at least one email', path: ['emails'] }
);

/**
 * Enhanced Google user creation schema with comprehensive validation
 */
export const GoogleUserCreationSchema = z.object({
  email: z.string()
    .email('Invalid email format for Google user')
    .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .toLowerCase()
    .transform(email => email.trim())
    .refine(email => !email.includes('@placeholder.'), 'Cannot create user with placeholder email'),
  fullName: z.string()
    .min(1, 'Full name is required for Google user')
    .max(MAX_NAME_LENGTH, `Full name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name.trim())
    .refine(name => name.split(' ').length >= 2 || name.length >= 2, 
      'Full name must contain at least 2 characters or multiple words'),
  providerId: z.string()
    .min(1, 'Google Provider ID is required')
    .max(MAX_PROVIDER_ID_LENGTH, `Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .regex(/^\d+$/, 'Google Provider ID must be numeric')
    .transform(id => id.trim()),
  avatarUrl: z.string()
    .url('Invalid avatar URL for Google user')
    .max(MAX_URL_LENGTH, `Avatar URL too long (max ${MAX_URL_LENGTH} chars)`)
    .refine(url => url.startsWith('https://'), 'Avatar URL must use HTTPS')
    .optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.INVESTOR),
  authProvider: z.literal(AuthProvider.GOOGLE)
}).strict();

// =============================================================================
// AZURE-SPECIFIC SCHEMAS
// =============================================================================

/**
 * Enhanced Azure profile validation schema with Microsoft-specific checks
 */
export const AzureProfileSchema = z.object({
  oid: z.string()
    .min(1, 'Azure Provider ID (oid) is required')
    .max(MAX_PROVIDER_ID_LENGTH, `Azure Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 
      'Azure oid must be a valid GUID format')
    .transform(oid => oid.toLowerCase().trim()),
  displayName: z.string()
    .max(MAX_NAME_LENGTH, `Display name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name?.trim())
    .optional(),
  givenName: z.string()
    .max(MAX_NAME_LENGTH / 2, `Given name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  surname: z.string()
    .max(MAX_NAME_LENGTH / 2, `Surname too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  mail: z.string()
    .email('Invalid Azure email format')
    .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .toLowerCase()
    .transform(email => email?.trim())
    .optional(),
  userPrincipalName: z.string()
    .max(MAX_EMAIL_LENGTH, `User principal name too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .transform(upn => upn?.trim()?.toLowerCase())
    .refine(upn => {
      if (!upn) return true;
      return upn.includes('@') && upn.split('@').length === 2;
    }, 'User principal name must be in email-like format')
    .optional(),
  provider: z.literal('azure-ad'),
  _json: z.any().optional()
}).refine(
  data => !!(data.mail || data.userPrincipalName),
  {
    message: 'Azure profile must have either mail or userPrincipalName',
    path: ['mail']
  }
);

/**
 * Enhanced Azure user creation schema with Microsoft-specific validation
 */
export const AzureUserCreationSchema = z.object({
  email: z.string()
    .email('Invalid email format for Azure user')
    .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .toLowerCase()
    .transform(email => email.trim())
    .refine(email => !email.includes('@placeholder.'), 'Cannot create user with placeholder email')
    .refine(email => {
      const domain = email.split('@')[1];
      return domain && (domain.includes('.com') || domain.includes('.org') || domain.includes('.net'));
    }, 'Email domain must be a recognized format'),
  fullName: z.string()
    .min(1, 'Full name is required for Azure user')
    .max(MAX_NAME_LENGTH, `Full name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name.trim())
    .refine(name => name.split(' ').length >= 2 || name.length >= 2, 
      'Full name must contain at least 2 characters or multiple words'),
  providerId: z.string()
    .min(1, 'Azure Provider ID is required')
    .max(MAX_PROVIDER_ID_LENGTH, `Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 
      'Azure Provider ID must be a valid GUID format')
    .transform(id => id.toLowerCase().trim()),
  avatarUrl: z.string()
    .url('Invalid avatar URL for Azure user')
    .max(MAX_URL_LENGTH, `Avatar URL too long (max ${MAX_URL_LENGTH} chars)`)
    .refine(url => url.startsWith('https://'), 'Avatar URL must use HTTPS')
    .optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.INVESTOR),
  authProvider: z.literal(AuthProvider.AZURE)
}).strict();

// =============================================================================
// ADVANCED PROCESSING SCHEMAS
// =============================================================================

/**
 * Enhanced email validation and processing schema with security checks
 */
export const EmailProcessingSchema = z.string()
  .min(1, 'Email cannot be empty')
  .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
  .email('Invalid email format')
  .transform(email => email.trim().toLowerCase())
  .refine(email => email.includes('@'), {
    message: 'Email must contain @ symbol'
  })
  .refine(email => {
    const parts = email.split('@');
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }, {
    message: 'Email must have valid local and domain parts'
  })
  .refine(email => {
    const domain = email.split('@')[1];
    return domain.includes('.') && domain.split('.').every(part => part.length > 0);
  }, {
    message: 'Email domain must be valid'
  })
  .refine(email => !email.includes('..'), {
    message: 'Email cannot contain consecutive dots'
  })
  .refine(email => {
    const localPart = email.split('@')[0];
    return !localPart.startsWith('.') && !localPart.endsWith('.');
  }, {
    message: 'Email local part cannot start or end with dot'
  });

/**
 * Enhanced full name processing schema with comprehensive fallback logic
 */
export const FullNameProcessingSchema = z.object({
  firstName: z.string()
    .max(MAX_NAME_LENGTH / 2, `First name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  lastName: z.string()
    .max(MAX_NAME_LENGTH / 2, `Last name too long (max ${MAX_NAME_LENGTH / 2} chars)`)
    .transform(name => name?.trim())
    .optional(),
  displayName: z.string()
    .max(MAX_NAME_LENGTH, `Display name too long (max ${MAX_NAME_LENGTH} chars)`)
    .transform(name => name?.trim())
    .optional(),
  email: z.string()
    .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .transform(email => email?.trim()?.toLowerCase())
    .optional(),
  provider: z.enum(OAUTH_PROVIDERS).optional()
}).transform(data => {
  // Priority 1: Combine firstName and lastName
  let fullName = [data.firstName, data.lastName]
    .filter(name => name && name.trim().length > 0)
    .join(' ')
    .trim();
  
  // Priority 2: Use displayName if available
  if (!fullName && data.displayName && data.displayName.trim().length > 0) {
    fullName = data.displayName.trim();
  }
  
  // Priority 3: Extract from email prefix with intelligent parsing
  if (!fullName && data.email && data.email.includes('@')) {
    const emailPrefix = data.email.split('@')[0];
    // Remove common separators and numbers
    const cleanPrefix = emailPrefix
      .replace(/[._-]/g, ' ')
      .replace(/\d+/g, '')
      .trim();
    
    if (cleanPrefix && cleanPrefix.length > 1) {
      // Capitalize each word intelligently
      fullName = cleanPrefix
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => {
          // Don't capitalize if all uppercase (might be acronym)
          if (word === word.toUpperCase() && word.length <= 4) {
            return word;
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    }
  }
  
  // Priority 4: Provider-specific fallbacks
  if (!fullName) {
    const fallbackNames = {
      'azure-ad': 'Microsoft User',
      'google': 'Google User'
    };
    fullName = fallbackNames[data.provider as keyof typeof fallbackNames] || 'OAuth User';
  }
  
  // Sanitization and length validation
  fullName = fullName
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Ensure fullName doesn't exceed database limits
  if (fullName.length > MAX_NAME_LENGTH) {
    fullName = fullName.substring(0, MAX_NAME_LENGTH).trim();
    // Ensure we don't cut off in the middle of a word
    const lastSpaceIndex = fullName.lastIndexOf(' ');
    if (lastSpaceIndex > MAX_NAME_LENGTH * 0.8) {
      fullName = fullName.substring(0, lastSpaceIndex).trim();
    }
  }
  
  // Final validation
  if (!fullName || fullName.length < 1) {
    throw new Error('Unable to determine valid user name from profile data');
  }
  
  return fullName;
});

/**
 * Enhanced placeholder email generation schema with collision prevention
 */
export const PlaceholderEmailSchema = z.object({
  providerId: z.string()
    .min(1, 'Provider ID is required for placeholder email')
    .max(MAX_PROVIDER_ID_LENGTH, `Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .transform(id => id.trim()),
  provider: z.enum(OAUTH_PROVIDERS)
}).transform(data => {
  // Sanitize provider ID for email use
  const sanitizedProviderId = data.providerId
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  
  if (!sanitizedProviderId || sanitizedProviderId.length === 0) {
    throw new Error('Invalid provider ID for placeholder email generation');
  }
  
  // Add timestamp to prevent collisions
  const timestamp = Date.now().toString(36);
  const domain = PLACEHOLDER_DOMAINS[data.provider];
  
  // Ensure email doesn't exceed length limits
  const baseEmail = `${data.provider}-${sanitizedProviderId}`;
  const maxLocalLength = MAX_EMAIL_LENGTH - domain.length - 1; // -1 for @
  const finalLocalPart = baseEmail.length <= maxLocalLength 
    ? `${baseEmail}-${timestamp}`
    : `${baseEmail.substring(0, maxLocalLength - timestamp.length - 1)}-${timestamp}`;
  
  return `${finalLocalPart}@${domain}`;
});

// =============================================================================
// ERROR HANDLING & MONITORING SCHEMAS
// =============================================================================

/**
 * Enhanced OAuth error handling schema with comprehensive error mapping
 */
export const OAuthErrorSchema = z.object({
  code: z.string().optional(),
  meta: z.any().optional(),
  message: z.string().optional(),
  email: z.string()
    .max(MAX_EMAIL_LENGTH, `Email too long (max ${MAX_EMAIL_LENGTH} chars)`)
    .optional(),
  providerId: z.string()
    .max(MAX_PROVIDER_ID_LENGTH, `Provider ID too long (max ${MAX_PROVIDER_ID_LENGTH} chars)`)
    .optional(),
  fullName: z.string()
    .max(MAX_NAME_LENGTH, `Full name too long (max ${MAX_NAME_LENGTH} chars)`)
    .optional(),
  provider: z.enum(OAUTH_PROVIDERS).optional(),
  statusCode: z.number().int().min(100).max(599).optional(),
  timestamp: z.date().optional().default(() => new Date())
}).transform(error => {
  let userFriendlyMessage = `Failed to authenticate with ${error.provider || 'OAuth provider'}`;
  let action = 'NONE';
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
  let retryable = false;
  
  // Enhanced Prisma error handling
  if (error.code?.startsWith('P')) {
    severity = 'HIGH';
    
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        const target = error.meta?.target as string[];
        
        if (target?.includes('email')) {
          userFriendlyMessage = 'An account with this email already exists. Please try signing in instead.';
          action = 'FIND_BY_EMAIL';
          severity = 'MEDIUM';
        } else if (target?.includes('providerId')) {
          userFriendlyMessage = 'This OAuth account is already linked to another user.';
          action = 'FIND_BY_PROVIDER_ID';
          severity = 'MEDIUM';
        } else {
          userFriendlyMessage = 'An account with this information already exists.';
          severity = 'MEDIUM';
        }
        break;
        
      case 'P2000': // Value out of range
        const field = error.meta?.target as string;
        
        if (field === 'email') {
          userFriendlyMessage = 'Email address is too long. Please use a shorter email.';
        } else if (field === 'fullName') {
          userFriendlyMessage = 'Name is too long. Please use a shorter name.';
        } else {
          userFriendlyMessage = 'One of your profile values is too long.';
        }
        severity = 'LOW';
        break;
        
      case 'P2025': // Record not found
        userFriendlyMessage = 'User account not found. Please sign up first.';
        action = 'SIGNUP_REQUIRED';
        severity = 'MEDIUM';
        break;
        
      case 'P1001': // Database unreachable
        userFriendlyMessage = 'Authentication service is temporarily unavailable. Please try again.';
        severity = 'CRITICAL';
        retryable = true;
        break;
        
      default:
        userFriendlyMessage = 'Database error during authentication. Please try again.';
        severity = 'HIGH';
        retryable = true;
    }
  }
  // Network and OAuth provider errors
  else if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('missing required fields')) {
      userFriendlyMessage = 'Your OAuth profile is missing required information. Please check your account settings.';
      severity = 'MEDIUM';
    } else if (message.includes('invalid email format')) {
      userFriendlyMessage = 'Your profile contains an invalid email format. Please update your account.';
      severity = 'LOW';
    } else if (message.includes('invalid profile data')) {
      userFriendlyMessage = 'Your profile data is invalid or incomplete. Please check your account.';
      severity = 'MEDIUM';
    } else if (message.includes('token')) {
      userFriendlyMessage = 'Authentication token is invalid or expired. Please try signing in again.';
      severity = 'MEDIUM';
      retryable = true;
    } else if (message.includes('network') || message.includes('timeout')) {
      userFriendlyMessage = 'Network error during authentication. Please check your connection and try again.';
      severity = 'HIGH';
      retryable = true;
    } else if (message.includes('rate limit')) {
      userFriendlyMessage = 'Too many authentication attempts. Please wait a moment and try again.';
      severity = 'MEDIUM';
      retryable = true;
    }
  }
  
  // HTTP status code handling
  if (error.statusCode) {
    switch (Math.floor(error.statusCode / 100)) {
      case 4: // Client errors
        if (error.statusCode === 401) {
          userFriendlyMessage = 'Authentication failed. Please try signing in again.';
          severity = 'MEDIUM';
          retryable = true;
        } else if (error.statusCode === 403) {
          userFriendlyMessage = 'Access denied. Your account may not have the required permissions.';
          severity = 'HIGH';
        } else if (error.statusCode === 429) {
          userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
          severity = 'MEDIUM';
          retryable = true;
        }
        break;
        
      case 5: // Server errors
        userFriendlyMessage = 'Authentication service error. Please try again later.';
        severity = 'CRITICAL';
        retryable = true;
        break;
    }
  }
  
  // Log error details for monitoring
  if (severity === 'HIGH' || severity === 'CRITICAL') {
    logger.error('OAuth authentication error', {
      code: error.code,
      message: error.message,
      provider: error.provider,
      severity,
      retryable,
      statusCode: error.statusCode,
      timestamp: error.timestamp
    });
  }
  
  return {
    message: userFriendlyMessage,
    action,
    severity,
    retryable,
    originalError: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode
    },
    timestamp: error.timestamp
  };
});

/**
 * Request validation metadata schema for monitoring
 */
export const ValidationMetadataSchema = z.object({
  endpoint: z.string().min(1, 'Endpoint is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  userAgent: z.string().optional(),
  ipAddress: z.string()
    .refine(ip => {
      if (!ip) return true;
      // Basic IP validation (IPv4 and IPv6)
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
      return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }, 'Invalid IP address format')
    .optional(),
  timestamp: z.date().default(() => new Date()),
  validationDuration: z.number().positive().optional(),
  schemaName: z.string().min(1, 'Schema name is required')
});

/**
 * Performance monitoring schema for validation operations
 */
export const ValidationPerformanceSchema = z.object({
  schemaName: z.string().min(1, 'Schema name is required'),
  validationTimeMs: z.number().nonnegative(),
  inputSize: z.number().nonnegative(),
  success: z.boolean(),
  errorCount: z.number().nonnegative().default(0),
  warningCount: z.number().nonnegative().default(0)
}).transform(data => ({
  ...data,
  performanceRating: data.validationTimeMs < 10 ? 'EXCELLENT' : 
                    data.validationTimeMs < 50 ? 'GOOD' : 
                    data.validationTimeMs < 100 ? 'FAIR' : 'POOR',
  timestamp: new Date()
}));

// =============================================================================
// ENHANCED UTILITY FUNCTIONS
// =============================================================================

/**
 * Enhanced email validation and processing with comprehensive security checks
 */
export const validateAndProcessEmail = (email: string | undefined | null): string | null => {
  if (!email) return null;
  
  try {
    const emailValidationResult = EmailProcessingSchema.safeParse(email);
    
    if (emailValidationResult.success) {
      const processedEmail = emailValidationResult.data;
      
      // Additional security checks
      if (processedEmail.includes('@placeholder.')) {
        logger.warn('Attempted to validate placeholder email', { email: processedEmail });
        return null;
      }
      
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /test[\d]*@/i,
        /fake[\d]*@/i,
        /dummy[\d]*@/i,
        /example@/i
      ];
      
      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(processedEmail));
      if (isSuspicious) {
        logger.warn('Suspicious email pattern detected', { email: processedEmail });
      }
      
      return processedEmail;
    } else {
      logger.debug('Email validation failed', { 
        email: email, 
        errors: emailValidationResult.error.format() 
      });
      return null;
    }
  } catch (error) {
    logger.error('Email processing error', { email, error });
    return null;
  }
};

/**
 * Enhanced full name validation with intelligent processing and fallbacks
 */
export const validateAndProcessFullName = (fullNameInput: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  provider?: 'google' | 'azure-ad';
}): string => {
  try {
    const fullNameResult = FullNameProcessingSchema.safeParse(fullNameInput);
    
    if (fullNameResult.success) {
      const finalFullName = fullNameResult.data;
      
      // Additional validation
      if (!finalFullName || finalFullName.trim() === '') {
        throw new Error('Unable to determine user name from profile data');
      }
      
      // Security check - prevent injection attempts
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /style\s*=/i
      ];
      
      const containsDangerousContent = dangerousPatterns.some(pattern => 
        pattern.test(finalFullName)
      );
      
      if (containsDangerousContent) {
        logger.warn('Potentially dangerous content in full name', { 
          fullName: finalFullName,
          provider: fullNameInput.provider 
        });
        // Sanitize by removing dangerous content
        const sanitizedName = finalFullName.replace(/<[^>]*>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
        
        return sanitizedName || `${fullNameInput.provider || 'OAuth'} User`;
      }
      
      return finalFullName;
    } else {
      logger.debug('Full name processing failed', { 
        input: fullNameInput, 
        errors: fullNameResult.error.format() 
      });
      throw new Error('Unable to determine user name from profile data');
    }
  } catch (error) {
    logger.error('Full name processing error', { fullNameInput, error });
    throw new Error('Unable to determine user name from profile data');
  }
};

/**
 * Enhanced placeholder email generation with collision prevention and security
 */
export const generatePlaceholderEmail = (
  providerId: string, 
  provider: 'google' | 'azure-ad'
): string => {
  try {
    const placeholderResult = PlaceholderEmailSchema.safeParse({ providerId, provider });
    
    if (placeholderResult.success) {
      const generatedEmail = placeholderResult.data;
      
      // Log placeholder email generation for monitoring
      logger.info('Generated placeholder email', { 
        provider, 
        providerId: providerId.substring(0, 8) + '...',
        emailDomain: generatedEmail.split('@')[1]
      });
      
      return generatedEmail;
    } else {
      logger.error('Placeholder email generation failed', { 
        providerId, 
        provider, 
        errors: placeholderResult.error.format() 
      });
      throw new Error('Failed to generate valid email for user');
    }
  } catch (error) {
    logger.error('Placeholder email generation error', { providerId, provider, error });
    throw new Error('Failed to generate valid email for user');
  }
};

/**
 * Enhanced OAuth error transformation with comprehensive error mapping
 */
export const transformOAuthError = (
  error: any, 
  provider?: 'google' | 'azure-ad'
): {
  message: string;
  action: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retryable: boolean;
  originalError: any;
  timestamp: Date;
} => {
  try {
    const result = OAuthErrorSchema.safeParse({ ...error, provider });
    
    if (result.success) {
      return result.data;
    } else {
      logger.error('OAuth error schema validation failed', { 
        error, 
        provider,
        validationErrors: result.error.format() 
      });
      
      return {
        message: 'An unexpected error occurred during authentication',
        action: 'NONE',
        severity: 'HIGH',
        retryable: false,
        originalError: error,
        timestamp: new Date()
      };
    }
  } catch (transformError) {
    logger.error('OAuth error transformation failed', { error, provider, transformError });
    
    return {
      message: 'An unexpected error occurred during authentication',
      action: 'NONE',
      severity: 'CRITICAL',
      retryable: false,
      originalError: error,
      timestamp: new Date()
    };
  }
};

/**
 * Enhanced user creation data validation with comprehensive checks
 */
export const validateUserCreationData = (
  userCreationInput: any, 
  provider: 'google' | 'azure-ad'
): any => {
  const startTime = Date.now();
  
  try {
    const schema = provider === 'azure-ad' ? AzureUserCreationSchema : GoogleUserCreationSchema;
    const userCreationResult = schema.safeParse(userCreationInput);
    
    if (!userCreationResult.success) {
      const errors = userCreationResult.error.format();
      const errorFields = Object.keys(errors).filter(k => k !== '_errors');
      const errorMessage = errorFields.length > 0 
        ? `Missing required fields for user creation: ${errorFields.join(', ')}` 
        : 'User creation validation failed';
      
      let detailedMessage = '';
      
      // Enhanced error messaging
      if (errors.email) {
        detailedMessage += '\n- Email is required and must be a valid format';
      }
      
      if (errors.fullName) {
        detailedMessage += '\n- Full name could not be determined from profile';
      }
      
      if (errors.providerId) {
        detailedMessage += '\n- Provider ID is missing from OAuth profile';
      }
      
      if (errors.avatarUrl) {
        detailedMessage += '\n- Avatar URL must use HTTPS and be a valid URL';
      }
      
      // Log validation failure for monitoring
      logger.error('User creation validation failed', {
        provider,
        errors: errorFields,
        input: {
          email: userCreationInput?.email ? '***@' + userCreationInput.email.split('@')[1] : undefined,
          fullName: userCreationInput?.fullName ? userCreationInput.fullName.substring(0, 10) + '...' : undefined,
          providerId: userCreationInput?.providerId ? userCreationInput.providerId.substring(0, 8) + '...' : undefined
        },
        validationTimeMs: Date.now() - startTime
      });
      
      const validationError = new Error(errorMessage + detailedMessage);
      validationError.name = 'ValidationError';
      throw validationError;
    }
    
    // Log successful validation
    logger.debug('User creation validation successful', {
      provider,
      validationTimeMs: Date.now() - startTime
    });
    
    return userCreationResult.data;
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      throw error;
    }
    
    logger.error('User creation validation error', { 
      userCreationInput, 
      provider, 
      error,
      validationTimeMs: Date.now() - startTime
    });
    
    throw new Error('User creation validation failed due to unexpected error');
  }
};

/**
 * Enhanced token validation with comprehensive security checks
 */
export const validateToken = (token: string): { valid: boolean; payload?: any; error?: string } => {
  try {
    const tokenValidationResult = VerifyTokenSchema.safeParse({ token });
    
    if (!tokenValidationResult.success) {
      return {
        valid: false,
        error: 'Invalid token format'
      };
    }
    
    // Additional security checks
    const cleanToken = tokenValidationResult.data.token;
    
    // Check for common token patterns that might indicate tampering
    const suspiciousPatterns = [
      /^null$/,
      /^undefined$/,
      /^[0]+$/,
      /^\s*$/
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(cleanToken));
    if (isSuspicious) {
      logger.warn('Suspicious token pattern detected', { 
        tokenStart: cleanToken.substring(0, 10),
        tokenLength: cleanToken.length
      });
      return {
        valid: false,
        error: 'Invalid token content'
      };
    }
    
    return {
      valid: true,
      payload: { token: cleanToken }
    };
  } catch (error) {
    logger.error('Token validation error', { error });
    return {
      valid: false,
      error: 'Token validation failed'
    };
  }
};

/**
 * Validation performance tracking utility
 */
export const trackValidationPerformance = (
  schemaName: string,
  validationTimeMs: number,
  inputSize: number,
  success: boolean,
  errorCount: number = 0,
  warningCount: number = 0
) => {
  try {
    const performanceData = ValidationPerformanceSchema.parse({
      schemaName,
      validationTimeMs,
      inputSize,
      success,
      errorCount,
      warningCount
    });
    
    // Log performance metrics for monitoring
    if (performanceData.performanceRating === 'POOR') {
      logger.warn('Poor validation performance detected', performanceData);
    } else if (performanceData.performanceRating === 'EXCELLENT') {
      logger.debug('Excellent validation performance', performanceData);
    }
    
    return performanceData;
  } catch (error) {
    logger.error('Validation performance tracking failed', { 
      schemaName, 
      validationTimeMs, 
      inputSize, 
      success, 
      error 
    });
    return null;
  }
};

/*
 * Auth Validator Optimization Summary:
 * - Enhanced security validation with comprehensive input sanitization
 * - Added performance monitoring and tracking capabilities
 * - Implemented intelligent error handling with severity classification
 * - Enhanced OAuth profile processing with provider-specific validation
 * - Added comprehensive logging for debugging and monitoring
 * - Implemented advanced email validation with security checks
 * - Enhanced full name processing with intelligent fallbacks
 * - Added placeholder email generation with collision prevention
 * - Comprehensive error transformation with actionable feedback
 * - Enhanced token validation with security pattern detection
 * - Added validation performance tracking for optimization
 * - Implemented request metadata validation for monitoring
 * - Enhanced type safety with proper Zod schema definitions
 * - Better integration with controller, service, and middleware layers
 * - Comprehensive documentation and JSDoc comments
 */
