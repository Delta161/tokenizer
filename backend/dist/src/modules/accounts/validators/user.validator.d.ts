/**
 * User Module Validators
 * Contains Zod schemas for validating user-related requests
 */
import { z } from 'zod';
import type { UserRole } from '@modules/accounts/types/auth.types';
/**
 * Create user schema
 */
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<typeof UserRole>>;
}, z.core.$strict>;
/**
 * Update user schema
 */
export declare const updateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<typeof UserRole>>;
}, z.core.$strict>;
/**
 * Change password schema
 */
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strict>;
/**
 * User ID param schema
 */
export declare const userIdParamSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strict>;
/**
 * User filter schema
 */
export declare const userFilterSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<typeof UserRole>>;
    search: z.ZodOptional<z.ZodString>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        email: "email";
        role: "role";
        firstName: "firstName";
        lastName: "lastName";
    }>>;
    sortDirection: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strict>;
//# sourceMappingURL=user.validator.d.ts.map