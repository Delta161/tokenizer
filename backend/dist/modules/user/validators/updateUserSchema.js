import { z } from 'zod';
// Validation schema for updating user profile
export const updateUserSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must not exceed 100 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
        .optional(),
    avatarUrl: z
        .string()
        .url('Avatar URL must be a valid URL')
        .max(500, 'Avatar URL must not exceed 500 characters')
        .optional()
        .nullable(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be in valid international format')
        .optional()
        .nullable(),
    timezone: z
        .string()
        .min(1, 'Timezone cannot be empty')
        .max(50, 'Timezone must not exceed 50 characters')
        .regex(/^[A-Za-z_\/]+$/, 'Invalid timezone format')
        .optional()
        .nullable(),
    preferredLanguage: z
        .string()
        .length(2, 'Preferred language must be a 2-character ISO code')
        .regex(/^[a-z]{2}$/, 'Preferred language must be lowercase ISO 639-1 code')
        .optional()
        .nullable(),
}).strict(); // Prevent additional properties
// Validation schema for user ID parameter
export const userIdParamSchema = z.object({
    id: z
        .string()
        .uuid('User ID must be a valid UUID'),
});
// Common validation functions
export const validateUpdateUserInput = (data) => {
    return updateUserSchema.safeParse(data);
};
export const validateUserIdParam = (data) => {
    return userIdParamSchema.safeParse(data);
};
//# sourceMappingURL=updateUserSchema.js.map