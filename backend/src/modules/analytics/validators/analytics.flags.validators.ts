import { z } from 'zod';

/**
 * Schema for updating a feature flag's enabled status
 */
export const UpdateFlagSchema = z.object({
  enabled: z.boolean(),
});

/**
 * Schema for validating the flag key parameter
 */
export const FlagKeyParamSchema = z.object({
  key: z.string(),
});

/**
 * Type for the validated update flag input
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
 * @param key - The flag key to validate
 * @returns The validation result
 */
export const validateFlagKey = (key: string) => {
  return FlagKeyParamSchema.safeParse({ key });
};