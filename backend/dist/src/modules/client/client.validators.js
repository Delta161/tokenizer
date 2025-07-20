import { z } from 'zod';
import { ClientStatus } from '@prisma/client';
/**
 * Client application validation schema
 */
export const clientApplicationSchema = z.object({
    companyName: z.string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must not exceed 100 characters')
        .trim(),
    contactEmail: z.string()
        .email('Invalid email format')
        .max(255, 'Email must not exceed 255 characters')
        .toLowerCase()
        .trim(),
    contactPhone: z.string()
        .min(8, 'Phone number must be at least 8 characters')
        .max(20, 'Phone number must not exceed 20 characters')
        .regex(/^[+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format')
        .trim(),
    country: z.string()
        .min(2, 'Country must be at least 2 characters')
        .max(50, 'Country must not exceed 50 characters')
        .trim(),
    legalEntityNumber: z.string()
        .max(50, 'Legal entity number must not exceed 50 characters')
        .trim()
        .optional(),
    walletAddress: z.string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address format')
        .optional()
});
/**
 * Client update validation schema
 */
export const clientUpdateSchema = z.object({
    companyName: z.string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must not exceed 100 characters')
        .trim()
        .optional(),
    contactEmail: z.string()
        .email('Invalid email format')
        .max(255, 'Email must not exceed 255 characters')
        .toLowerCase()
        .trim()
        .optional(),
    contactPhone: z.string()
        .min(8, 'Phone number must be at least 8 characters')
        .max(20, 'Phone number must not exceed 20 characters')
        .regex(/^[+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format')
        .trim()
        .optional(),
    country: z.string()
        .min(2, 'Country must be at least 2 characters')
        .max(50, 'Country must not exceed 50 characters')
        .trim()
        .optional(),
    legalEntityNumber: z.string()
        .max(50, 'Legal entity number must not exceed 50 characters')
        .trim()
        .optional(),
    walletAddress: z.string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address format')
        .optional(),
    logoUrl: z.string()
        .url('Invalid URL format')
        .max(500, 'Logo URL must not exceed 500 characters')
        .optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});
/**
 * Client status update validation schema
 */
export const clientStatusUpdateSchema = z.object({
    status: z.nativeEnum(ClientStatus, {
        errorMap: () => ({ message: 'Status must be PENDING, APPROVED, or REJECTED' })
    })
});
/**
 * Client ID parameter validation schema
 */
export const clientIdParamSchema = z.object({
    id: z.string()
        .uuid('Invalid client ID format')
});
/**
 * Client list query validation schema
 */
export const clientListQuerySchema = z.object({
    limit: z.coerce.number()
        .int('Limit must be an integer')
        .positive('Limit must be a positive number')
        .max(100, 'Limit cannot exceed 100')
        .optional()
        .default(50),
    offset: z.coerce.number()
        .int('Offset must be an integer')
        .nonnegative('Offset must be a non-negative number')
        .optional()
        .default(0),
    status: z.nativeEnum(ClientStatus)
        .optional()
});
/**
 * Validation helper functions
 */
export const validateClientApplication = (data) => {
    return clientApplicationSchema.safeParse(data);
};
export const validateClientUpdate = (data) => {
    return clientUpdateSchema.safeParse(data);
};
export const validateClientStatusUpdate = (data) => {
    return clientStatusUpdateSchema.safeParse(data);
};
export const validateClientIdParam = (data) => {
    return clientIdParamSchema.safeParse(data);
};
export const validateClientListQuery = (data) => {
    return clientListQuerySchema.safeParse(data);
};
//# sourceMappingURL=client.validators.js.map