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
 * Type for the validated visit creation data
 */
export type CreateVisitInput = z.infer<typeof createVisitSchema>;

/**
 * Validates the visit creation request data
 * @param data - The data to validate
 * @returns The validation result
 */
export const validateCreateVisit = (data: unknown) => {
  return createVisitSchema.safeParse(data);
};