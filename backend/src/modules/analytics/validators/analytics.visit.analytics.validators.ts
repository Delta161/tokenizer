import { z } from 'zod';
import { VisitTimeRange } from '../types/analytics.visit.analytics.types.js';

/**
 * Validator for property ID parameter
 */
export const propertyIdSchema = z.object({
  id: z.string().trim().min(1, 'Property ID is required')
});

/**
 * Validator for client ID parameter
 */
export const clientIdSchema = z.object({
  id: z.string().trim().min(1, 'Client ID is required')
});

/**
 * Validator for time range query parameter
 */
export const timeRangeSchema = z.object({
  range: z.enum([VisitTimeRange.WEEK, VisitTimeRange.MONTH, VisitTimeRange.QUARTER])
    .optional()
    .default(VisitTimeRange.MONTH)
});

/**
 * Type for the validated property ID parameter
 */
export type PropertyIdInput = z.infer<typeof propertyIdSchema>;

/**
 * Type for the validated client ID parameter
 */
export type ClientIdInput = z.infer<typeof clientIdSchema>;

/**
 * Type for the validated time range parameter
 */
export type TimeRangeInput = z.infer<typeof timeRangeSchema>;

/**
 * Validate property ID parameter
 * @param id - The property ID to validate
 * @returns The validation result
 */
export const validatePropertyId = (id: string) => {
  return propertyIdSchema.safeParse({ id });
};

/**
 * Validate client ID parameter
 * @param id - The client ID to validate
 * @returns The validation result
 */
export const validateClientId = (id: string) => {
  return clientIdSchema.safeParse({ id });
};

/**
 * Validate time range query parameter
 * @param range - The time range to validate
 * @returns The validation result
 */
export const validateTimeRange = (range?: string) => {
  return timeRangeSchema.safeParse({ range });
};