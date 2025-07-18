import { z } from 'zod';
import { UserRole, PropertyStatus } from '@prisma/client';
/**
 * Validator for updating a user's role
 */
export const updateUserRoleSchema = z.object({
    role: z.enum([UserRole.INVESTOR, UserRole.CLIENT, UserRole.ADMIN], {
        errorMap: () => ({ message: 'Role must be one of: INVESTOR, CLIENT, ADMIN' }),
    }),
});
/**
 * Validator for updating a user's active status
 */
export const updateUserStatusSchema = z.object({
    isActive: z.boolean({
        errorMap: () => ({ message: 'isActive must be a boolean value' }),
    }),
});
/**
 * Validator for moderating a property
 */
export const moderatePropertySchema = z.object({
    status: z.enum([PropertyStatus.APPROVED, PropertyStatus.REJECTED], {
        errorMap: () => ({ message: 'Status must be either APPROVED or REJECTED' }),
    }),
    comment: z.string().optional().refine((val, ctx) => {
        if (ctx.data.status === PropertyStatus.REJECTED && (!val || val.trim() === '')) {
            return false;
        }
        return true;
    }, {
        message: 'Comment is required when rejecting a property',
    }),
});
/**
 * Validator for admin broadcast notifications
 */
export const adminNotificationSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).max(100, {
        message: 'Title cannot exceed 100 characters',
    }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters long' }).max(1000, {
        message: 'Message cannot exceed 1000 characters',
    }),
    targetRoles: z
        .array(z.enum([UserRole.INVESTOR, UserRole.CLIENT], {
        errorMap: () => ({ message: 'Target roles must be either INVESTOR or CLIENT' }),
    }))
        .min(1, { message: 'At least one target role must be specified' }),
});
/**
 * Validator for user listing query parameters
 */
export const userListQuerySchema = z.object({
    role: z
        .enum([UserRole.INVESTOR, UserRole.CLIENT, UserRole.ADMIN], {
        errorMap: () => ({ message: 'Role must be one of: INVESTOR, CLIENT, ADMIN' }),
    })
        .optional(),
    email: z.string().optional(),
    registrationDateFrom: z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return !isNaN(Date.parse(val));
    }, { message: 'Registration date from must be a valid date string' }),
    registrationDateTo: z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return !isNaN(Date.parse(val));
    }, { message: 'Registration date to must be a valid date string' }),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
});
/**
 * Validator for property listing query parameters
 */
export const propertyListQuerySchema = z.object({
    status: z
        .enum([PropertyStatus.DRAFT, PropertyStatus.SUBMITTED, PropertyStatus.APPROVED, PropertyStatus.REJECTED], {
        errorMap: () => ({
            message: 'Status must be one of: DRAFT, SUBMITTED, APPROVED, REJECTED',
        }),
    })
        .optional(),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
});
/**
 * Validator for token listing query parameters
 */
export const tokenListQuerySchema = z.object({
    symbol: z.string().optional(),
    chainId: z.string().optional(),
    propertyId: z.string().optional(),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
});
/**
 * Validator for date range query parameters
 */
export const dateRangeQuerySchema = z.object({
    from: z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return !isNaN(Date.parse(val));
    }, { message: 'From date must be a valid date string in YYYY-MM-DD format' }),
    to: z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return !isNaN(Date.parse(val));
    }, { message: 'To date must be a valid date string in YYYY-MM-DD format' }),
});
/**
 * Validator for property submission query parameters
 */
export const propertySubmissionQuerySchema = z.object({
    from: z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return !isNaN(Date.parse(val));
    }, { message: 'From date must be a valid date string in YYYY-MM-DD format' }),
    to: z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return !isNaN(Date.parse(val));
    }, { message: 'To date must be a valid date string in YYYY-MM-DD format' }),
    status: z
        .enum([PropertyStatus.DRAFT, PropertyStatus.SUBMITTED, PropertyStatus.APPROVED, PropertyStatus.REJECTED], {
        errorMap: () => ({
            message: 'Status must be one of: DRAFT, SUBMITTED, APPROVED, REJECTED',
        }),
    })
        .optional(),
});
//# sourceMappingURL=admin.validators.js.map