import { z } from 'zod';
import { VisitTimeRange } from '../types/visit.analytics.types.js';

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
 * Validate property ID parameter
 */
export const validatePropertyId = (id: string): z.SafeParseReturnType<{ id: string }, { id: string }> => {
  return propertyIdSchema.safeParse({ id });
};

/**
 * Validate client ID parameter
 */
export const validateClientId = (id: string): z.SafeParseReturnType<{ id: string }, { id: string }> => {
  return clientIdSchema.safeParse({ id });
};

/**
 * Validate time range query parameter
 */
export const validateTimeRange = (range?: string): z.SafeParseReturnType<{ range?: string }, { range?: string }> => {
  return timeRangeSchema.safeParse({ range });
};