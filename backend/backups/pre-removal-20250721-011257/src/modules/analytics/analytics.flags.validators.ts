import { z } from 'zod';

/**
 * Schema for updating a feature flag
 */
export const UpdateFlagSchema = z.object({ 
  enabled: z.boolean() 
});

/**
 * Schema for validating feature flag key parameter
 */
export const FlagKeyParamSchema = z.object({ 
  key: z.string().min(1, 'Flag key is required') 
});

/**
 * Type for the validated update flag data
 */
export type UpdateFlagInput = z.infer<typeof UpdateFlagSchema>;

/**
 * Type for the validated flag key parameter
 */
export type FlagKeyParamInput = z.infer<typeof FlagKeyParamSchema>;

/**
 * Validates the update flag request data
 * @param data - The data to validate
 * @returns The validation result
 */
export const validateUpdateFlag = (data: unknown) => {
  return UpdateFlagSchema.safeParse(data);
};

/**
 * Validates the flag key parameter
 * @param data - The data to validate
 * @returns The validation result
 */
export const validateFlagKey = (data: unknown) => {
  return FlagKeyParamSchema.safeParse(data);
};