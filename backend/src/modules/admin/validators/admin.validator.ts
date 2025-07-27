import { z } from 'zod';
import { UserRole, PropertyStatus } from '@prisma/client';
import { KycStatus } from '../../accounts/types/kyc.types.js';
import { PAGINATION } from '../../../config/constants.js';

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
  }).min(10, 'Message must be at least 10 characters').max(1000, 'Message must be at most 1000 characters'),
  userRole: z.nativeEnum(UserRole).nullable().optional(),
});

/**
 * Validator for pagination query parameters
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(PAGINATION.DEFAULT_LIMIT),
});

/**
 * Validator for sorting query parameters
 */
export const sortingQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Validator for user filtering query parameters
 */
export const userFilterQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().optional(),
});

/**
 * Combined validator for user listing query parameters
 */
export const getUsersQuerySchema = paginationQuerySchema.merge(sortingQuerySchema).merge(userFilterQuerySchema);

/**
 * Validator for date range query parameters
 */
export const dateRangeQuerySchema = z.object({
  startDate: z.coerce.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Start date must be a valid date',
  }),
  endDate: z.coerce.date({
    required_error: 'End date is required',
    invalid_type_error: 'End date must be a valid date',
  }),
  interval: z.enum(['day', 'week', 'month']).optional().default('day'),
}).refine(data => data.startDate <= data.endDate, {
  message: 'Start date must be before or equal to end date',
  path: ['startDate'],
});

/**
 * Validator for property submission query parameters
 */
export const propertySubmissionQuerySchema = dateRangeQuerySchema.extend({
  status: z.nativeEnum(PropertyStatus).optional(),
});