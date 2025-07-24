import { z } from 'zod';
import { UserRole, PropertyStatus } from '@prisma/client';
import { KycStatus } from '@modules/accounts/types/kyc.types';

/**
 * Validator for updating user role
 */
export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid user role' }),
  }),
});

/**
 * Validator for updating user status
 */
export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: 'isActive is required',
    invalid_type_error: 'isActive must be a boolean',
  }),
});

/**
 * Validator for moderating property
 */
export const moderatePropertySchema = z.object({
  status: z.enum([PropertyStatus.APPROVED, PropertyStatus.REJECTED], {
    errorMap: () => ({ message: 'Status must be either APPROVED or REJECTED' }),
  }),
  comment: z.string({
    required_error: 'Comment is required',
  }).min(1, 'Comment cannot be empty')
    .refine(val => {
      // If status is REJECTED, comment is required to be more substantial
      return true;
    }, {
      message: 'When rejecting a property, please provide a detailed reason',
      path: ['comment'],
    }),
});

/**
 * Validator for admin notifications
 */
export const adminNotificationSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
  }).min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  
  message: z.string({
    required_error: 'Message is required',
  }).min(10, 'Message must be at least 10 characters').max(2000, 'Message must be at most 2000 characters'),
  
  targetRoles: z.array(
    z.nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Invalid user role' }),
    })
  ).min(1, 'At least one target role must be specified'),
});

/**
 * Validator for user list query parameters
 */
export const userListQuerySchema = z.object({
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid user role' }),
  }).optional(),
  
  email: z.string().email('Invalid email format').optional(),
  
  registrationDateFrom: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format for registrationDateFrom',
    })
    .optional(),
  
  registrationDateTo: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format for registrationDateTo',
    })
    .optional(),
  
  limit: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Limit must be a positive number',
    })
    .optional(),
  
  offset: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Offset must be a non-negative number',
    })
    .optional(),
});

/**
 * Validator for property list query parameters
 */
export const propertyListQuerySchema = z.object({
  status: z.nativeEnum(PropertyStatus, {
    errorMap: () => ({ message: 'Invalid property status' }),
  }).optional(),
  
  limit: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Limit must be a positive number',
    })
    .optional(),
  
  offset: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Offset must be a non-negative number',
    })
    .optional(),
});

/**
 * Validator for token list query parameters
 */
export const tokenListQuerySchema = z.object({
  symbol: z.string().optional(),
  
  chainId: z.string()
    .refine(val => !val || !isNaN(Number(val)), {
      message: 'Chain ID must be a number',
    })
    .optional(),
  
  propertyId: z.string().uuid('Invalid property ID format').optional(),
  
  limit: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Limit must be a positive number',
    })
    .optional(),
  
  offset: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Offset must be a non-negative number',
    })
    .optional(),
});

/**
 * Validator for KYC list query parameters
 */
export const kycListQuerySchema = z.object({
  status: z.nativeEnum(KycStatus, {
    errorMap: () => ({ message: 'Invalid KYC status' }),
  }).optional(),
  
  userId: z.string().uuid('Invalid user ID format').optional(),
  
  limit: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Limit must be a positive number',
    })
    .optional(),
  
  offset: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: 'Offset must be a non-negative number',
    })
    .optional(),
});

/**
 * Validator for date range query parameters
 */
export const dateRangeQuerySchema = z.object({
  dateFrom: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format for dateFrom',
    })
    .optional(),
  
  dateTo: z.string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format for dateTo',
    })
    .optional(),
});