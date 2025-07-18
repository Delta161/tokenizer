import { z } from 'zod';
import { VisitTimeRange } from '../types/visit.analytics.types.js';
/**
 * Validator for property ID parameter
 */
export declare const propertyIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Validator for client ID parameter
 */
export declare const clientIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Validator for time range query parameter
 */
export declare const timeRangeSchema: z.ZodObject<{
    range: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        7: VisitTimeRange.WEEK;
        30: VisitTimeRange.MONTH;
        90: VisitTimeRange.QUARTER;
    }>>>;
}, z.core.$strip>;
/**
 * Validate property ID parameter
 */
export declare const validatePropertyId: (id: string) => z.SafeParseReturnType<{
    id: string;
}, {
    id: string;
}>;
/**
 * Validate client ID parameter
 */
export declare const validateClientId: (id: string) => z.SafeParseReturnType<{
    id: string;
}, {
    id: string;
}>;
/**
 * Validate time range query parameter
 */
export declare const validateTimeRange: (range?: string) => z.SafeParseReturnType<{
    range?: string;
}, {
    range?: string;
}>;
//# sourceMappingURL=visit.analytics.validators.d.ts.map