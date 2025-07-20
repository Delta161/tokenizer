/**
 * Auth Module Validators
 * Contains Zod schemas for validating auth-related requests
 */
import { z } from 'zod';
import type { UserRole } from '@modules/accounts/types/auth.types';
/**
 * Login credentials schema
 */
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strict>;
/**
 * Registration data schema
 */
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<typeof UserRole>>;
}, z.core.$strict>;
/**
 * Password reset request schema
 */
export declare const passwordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strict>;
/**
 * Password reset confirmation schema
 */
export declare const passwordResetConfirmSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, z.core.$strict>;
//# sourceMappingURL=auth.validator.d.ts.map