import { z } from 'zod';
/**
 * Validator for updating a user's role
 */
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        INVESTOR: "INVESTOR";
        CLIENT: "CLIENT";
        ADMIN: "ADMIN";
    }>;
}, z.core.$strip>;
/**
 * Validator for updating a user's active status
 */
export declare const updateUserStatusSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Validator for moderating a property
 */
export declare const moderatePropertySchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validator for admin broadcast notifications
 */
export declare const adminNotificationSchema: z.ZodObject<{
    title: z.ZodString;
    message: z.ZodString;
    targetRoles: z.ZodArray<z.ZodEnum<{
        INVESTOR: "INVESTOR";
        CLIENT: "CLIENT";
    }>>;
}, z.core.$strip>;
/**
 * Validator for user listing query parameters
 */
export declare const userListQuerySchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<{
        INVESTOR: "INVESTOR";
        CLIENT: "CLIENT";
        ADMIN: "ADMIN";
    }>>;
    email: z.ZodOptional<z.ZodString>;
    registrationDateFrom: z.ZodOptional<z.ZodString>;
    registrationDateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    offset: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
/**
 * Validator for property listing query parameters
 */
export declare const propertyListQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        [x: string]: any;
    }>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    offset: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
/**
 * Validator for token listing query parameters
 */
export declare const tokenListQuerySchema: z.ZodObject<{
    symbol: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodString>;
    propertyId: z.ZodOptional<z.ZodString>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    offset: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
/**
 * Validator for date range query parameters
 */
export declare const dateRangeQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validator for property submission query parameters
 */
export declare const propertySubmissionQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        [x: string]: any;
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=admin.validators.d.ts.map