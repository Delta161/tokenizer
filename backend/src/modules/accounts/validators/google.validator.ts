/**
 * Google Auth Validator
 * Contains Zod schemas for validating Google-specific authentication
 */

// External packages
import { z } from 'zod';

// Internal modules
import { UserRole } from '../types/auth.types';
import { AuthProvider } from '@prisma/client';

/**
 * Google profile validation schema
 */
export const GoogleProfileSchema = z.object({
  id: z.string().min(1, 'Provider ID is required'),
  displayName: z.string().optional(),
  name: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional()
  }).optional(),
  emails: z.array(
    z.object({
      value: z.string().email('Invalid email format'),
      verified: z.boolean().optional()
    })
  ).optional(),
  photos: z.array(
    z.object({
      value: z.string().url('Invalid photo URL')
    })
  ).optional(),
  provider: z.literal('google'),
  _json: z.any().optional()
});

/**
 * Full name validation schema for Google profiles
 * Validates and processes full name with fallbacks
 */
export const GoogleFullNameSchema = z.object({
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
    fullName = 'Google User';
  }
  
  // Ensure fullName doesn't exceed database column limit (255 chars)
  if (fullName.length > 255) {
    fullName = fullName.substring(0, 255);
  }
  
  return fullName;
});

/**
 * Validates and processes full name from Google profile
 * Returns formatted full name or throws error if validation fails
 */
export const validateAndProcessFullName = (fullNameInput: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
}) => {
  const fullNameResult = GoogleFullNameSchema.safeParse(fullNameInput);
  
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
 * Google user creation schema
 * Validates all required fields for creating a user from Google profile
 */
export const GoogleUserCreationSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(1, 'Full name is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  role: z.nativeEnum(UserRole).optional().default('INVESTOR'),
  authProvider: z.literal('GOOGLE')
}).strict();