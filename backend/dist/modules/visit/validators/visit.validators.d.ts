import { z } from 'zod';
/**
 * Zod schema for validating visit creation requests
 */
export declare const createVisitSchema: z.ZodObject<{
    propertyId: z.ZodString;
}, z.core.$strip>;
/**
 * Type for the validated visit creation data
 */
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
/**
 * Validates the visit creation request data
 * @param data - The data to validate
 * @returns The validation result
 */
export declare const validateCreateVisit: (data: unknown) => z.ZodSafeParseResult<{
    propertyId: string;
}>;
//# sourceMappingURL=visit.validators.d.ts.map