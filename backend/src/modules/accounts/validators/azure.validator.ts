/**
 * Azure Auth Validator
 * Contains Zod schemas for validating Azure-specific authentication
 */

// External packages
import { z } from 'zod';

// Internal modules
import { UserRole } from '../types/auth.types';
import { AuthProvider } from '@prisma/client';

/**
 * Azure profile validation schema
 */
export const AzureProfileSchema = z.object({
  oid: z.string().min(1, 'Provider ID (oid) is required'),
  displayName: z.string().optional(),
  givenName: z.string().optional(),
  surname: z.string().optional(),
  mail: z.string().email('Invalid email format').optional(),
  userPrincipalName: z.string().optional(),
  provider: z.literal('azure-ad'),
  _json: z.any().optional()
});

/**
 * Email validation schema for Azure profiles
 * Validates and processes email with fallbacks
 */
export const AzureEmailSchema = z.string()
  .email('Invalid email format')
  .transform(email => email.trim().toLowerCase())
  .refine(email => email.includes('@'), {
    message: 'Email must contain @ symbol'
  });

/**
 * Placeholder email generator schema
 * For when Azure profile doesn't provide a valid email
 */
export const AzurePlaceholderEmailSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required')
}).transform(data => {
  const sanitizedProviderId = data.providerId.replace(/[^a-zA-Z0-9]/g, '');
  return `azure-${sanitizedProviderId}@placeholder.azure.auth`;
});

/**
 * Full name validation schema for Azure profiles
 * Validates and processes full name with fallbacks
 */
export const AzureFullNameSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  email: z.string().optional()
}).transform(data => {
  // First try to combine firstName and lastName
  let fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
  
  // If fullName is empty, use displayName
  if (!fullName && data.displayName) {
    fullName = data.displayName.trim();
  }
  
  // If still empty and we have email, use email prefix
  if (!fullName && data.email && data.email.includes('@')) {
    const emailPrefix = data.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    if (emailPrefix && emailPrefix.trim() !== '') {
      // Capitalize each word in the email prefix
      fullName = emailPrefix
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // Last fallback: use default placeholder
  if (!fullName) {
    fullName = 'Azure User';
  }
  
  // Ensure fullName doesn't exceed database column limit (255 chars)
  if (fullName.length > 255) {
    fullName = fullName.substring(0, 255);
  }
  
  return fullName;
});

/**
 * Validates and processes full name from Azure profile
 * Returns formatted full name or throws error if validation fails
 */
export const validateAndProcessFullName = (fullNameInput: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
}) => {
  const fullNameResult = AzureFullNameSchema.safeParse(fullNameInput);
  
  if (fullNameResult.success) {
    const finalFullName = fullNameResult.data;
    
    // Final validation to ensure we have a non-empty fullName
    if (!finalFullName || finalFullName.trim() === '') {
      throw new Error('Unable to determine user name from profile data');
    }
    
    return finalFullName;
  } else {
    throw new Error('Unable to determine user name from profile data');
  }
};

/**
 * Azure user creation schema
 * Validates all required fields for creating a user from Azure profile
 */
export const AzureUserCreationSchema = z.object({
  email: AzureEmailSchema,
  fullName: z.string().min(1, 'Full name is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  role: z.nativeEnum(UserRole).optional().default('INVESTOR'),
  authProvider: z.literal('AZURE')
}).strict();

/**
 * Azure error handling schema
 * Maps error types to user-friendly messages and actions
 */
export const AzureErrorSchema = z.object({
  code: z.string().optional(),
  meta: z.any().optional(),
  message: z.string().optional(),
  email: z.string().optional(),
  providerId: z.string().optional(),
  fullName: z.string().optional()
}).transform(error => {
  let userFriendlyMessage = 'Failed to authenticate with Azure';
  let action = 'NONE';
  
  if (error.code?.startsWith('P')) {
    // Prisma error
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[];
      
      if (target?.includes('email')) {
        userFriendlyMessage = 'A user with this email already exists';
        action = 'FIND_BY_EMAIL';
      } else if (target?.includes('providerId')) {
        userFriendlyMessage = 'A user with this provider ID already exists';
        action = 'FIND_BY_PROVIDER_ID';
      } else {
        userFriendlyMessage = 'A user with this information already exists';
      }
    } else if (error.code === 'P2000') {
      const target = error.meta?.target as string;
      
      if (target === 'email') {
        userFriendlyMessage = 'Email address is too long';
      } else if (target === 'fullName') {
        userFriendlyMessage = 'Full name is too long';
      } else {
        userFriendlyMessage = 'One of your profile values is too long';
      }
    } else {
      userFriendlyMessage = 'Database error during authentication';
    }
  } else if (error.message) {
    // Message-based errors
    if (error.message.includes('Missing required fields')) {
      userFriendlyMessage = 'Your profile is missing required information';
    } else if (error.message.includes('Invalid email format')) {
      userFriendlyMessage = 'Your profile contains an invalid email format';
    } else if (error.message.includes('Invalid profile data')) {
      userFriendlyMessage = 'Your profile data is invalid or incomplete';
    }
  }
  
  return {
    message: userFriendlyMessage,
    action
  };
});

/**
 * Transforms errors into user-friendly messages
 * @param error The error to transform
 * @returns An object with user-friendly message and action
 */
export const transformAzureError = (error: any) => {
  // Use the AzureErrorSchema to transform the error
  const result = AzureErrorSchema.safeParse(error);
  
  if (result.success) {
    return result.data;
  } else {
    // Fallback for errors that don't match the schema
    return {
      message: 'An unexpected error occurred during authentication',
      action: 'NONE',
      originalError: error
    };
  }
};

/**
 * Validates and processes email from Azure profile
 * Returns processed email or null if validation fails
 */
export const validateAndProcessEmail = (email: string | undefined | null) => {
  if (!email) return null;
  
  const emailValidationResult = AzureEmailSchema.safeParse(email);
  
  if (emailValidationResult.success) {
    return emailValidationResult.data;
  }
  
  return null;
};

/**
 * Generates a placeholder email for Azure users without valid email
 */
export const generatePlaceholderEmail = (providerId: string) => {
  const placeholderResult = AzurePlaceholderEmailSchema.safeParse({ providerId });
  
  if (placeholderResult.success) {
    return placeholderResult.data.email;
  }
  
  throw new Error('Failed to generate valid email for user');
};

/**
 * Validates and processes user creation data from Azure profile
 * Returns user-friendly error message if validation fails
 */
export const validateUserCreationData = (userCreationInput: any) => {
  const userCreationResult = AzureUserCreationSchema.safeParse(userCreationInput);
  
  if (!userCreationResult.success) {
    const errors = userCreationResult.error.format();
    const errorFields = Object.keys(errors).filter(k => k !== '_errors');
    const errorMessage = errorFields.length > 0 
      ? `Missing required fields for user creation: ${errorFields.join(', ')}` 
      : 'User creation validation failed';
    
    // Create detailed error message
    let detailedMessage = '';
    
    if (errors.email) {
      detailedMessage += '\n- Email is required and must be a valid format';
    }
    
    if (errors.fullName) {
      detailedMessage += '\n- Full name could not be determined from profile';
    }
    
    if (errors.providerId) {
      detailedMessage += '\n- Provider ID is missing from Azure profile';
    }
    
    const validationError = new Error(errorMessage);
    validationError.name = 'ValidationError';
    throw validationError;
  }
  
  return userCreationResult.data;
};