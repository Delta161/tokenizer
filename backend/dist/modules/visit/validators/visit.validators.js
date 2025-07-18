import { z } from 'zod';
/**
 * Zod schema for validating visit creation requests
 */
export const createVisitSchema = z.object({
    propertyId: z.string().uuid({
        message: 'Property ID must be a valid UUID',
    }),
});
/**
 * Validates the visit creation request data
 * @param data - The data to validate
 * @returns The validation result
 */
export const validateCreateVisit = (data) => {
    return createVisitSchema.safeParse(data);
};
//# sourceMappingURL=visit.validators.js.map