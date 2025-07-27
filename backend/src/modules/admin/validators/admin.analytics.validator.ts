import { z } from 'zod';
import { PropertyStatus } from '@prisma/client';

/**
 * Validator for date range query parameters
 */
export const analyticsDateRangeSchema = z.object({
  startDate: z.coerce.date().pipe(z.date()).or(z.string().transform((val) => new Date(val))).superRefine((val, ctx) => {
    if (!val || isNaN(val.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: 'Start date must be a valid date'
      });
    }
  }),
  endDate: z.coerce.date().pipe(z.date()).or(z.string().transform((val) => new Date(val))).superRefine((val, ctx) => {
    if (!val || isNaN(val.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: 'End date must be a valid date'
      });
    }
  }),
}).refine(data => data.startDate <= data.endDate, {
  message: 'Start date must be before or equal to end date',
  path: ['startDate'],
});

/**
 * Validator for user registration query parameters
 */
export const userRegistrationQuerySchema = analyticsDateRangeSchema.extend({
  interval: z.enum(['day', 'week', 'month']).optional().default('day'),
});

/**
 * Validator for property submission query parameters
 */
export const propertySubmissionQuerySchema = analyticsDateRangeSchema.extend({
  status: z.nativeEnum(PropertyStatus).optional(),
});