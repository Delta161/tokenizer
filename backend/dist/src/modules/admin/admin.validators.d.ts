import { z } from 'zod';
/**
 * Validator for updating user role
 */
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodEnum<{
        INVESTOR: "INVESTOR";
        CLIENT: "CLIENT";
        ADMIN: "ADMIN";
    }>;
}, z.core.$strip>;
/**
 * Validator for updating user status
 */
export declare const updateUserStatusSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Validator for moderating property
 */
export declare const moderatePropertySchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
    comment: z.ZodString;
}, z.core.$strip>;
/**
 * Validator for admin notifications
 */
export declare const adminNotificationSchema: z.ZodObject<{
    title: z.ZodString;
    message: z.ZodString;
    targetRoles: z.ZodArray<z.ZodEnum<{
        INVESTOR: "INVESTOR";
        CLIENT: "CLIENT";
        ADMIN: "ADMIN";
    }>>;
}, z.core.$strip>;
/**
 * Validator for user list query parameters
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
    limit: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validator for property list query parameters
 */
export declare const propertyListQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    limit: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validator for token list query parameters
 */
export declare const tokenListQuerySchema: z.ZodObject<{
    symbol: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodString>;
    propertyId: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validator for KYC list query parameters
 */
export declare const kycListQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<any>>;
    userId: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validator for date range query parameters
 */
export declare const dateRangeQuerySchema: z.ZodObject<{
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=admin.validators.d.ts.map