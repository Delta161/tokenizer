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
    .max(255, 'Logo URL must not exceed 255 characters')
    .optional()
});

/**
 * Client status update validation schema
 */
export const clientStatusUpdateSchema = z.object({
  status: z.nativeEnum(ClientStatus, {
    errorMap: () => ({ message: 'Invalid client status' })
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
  page: z.coerce.number()
    .int('Page must be an integer')
    .positive('Page must be positive')
    .optional(),
  limit: z.coerce.number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .optional(),
  status: z.nativeEnum(ClientStatus, {
    errorMap: () => ({ message: 'Invalid client status' })
  }).optional(),
  search: z.string()
    .max(100, 'Search query must not exceed 100 characters')
    .optional()
});

/**
 * Validate client application data
 */
export const validateClientApplication = (data: unknown) => {
  return clientApplicationSchema.safeParse(data);
};

/**
 * Validate client update data
 */
export const validateClientUpdate = (data: unknown) => {
  return clientUpdateSchema.safeParse(data);
};

/**
 * Validate client status update data
 */
export const validateClientStatusUpdate = (data: unknown) => {
  return clientStatusUpdateSchema.safeParse(data);
};

/**
 * Validate client ID parameter
 */
export const validateClientIdParam = (params: unknown) => {
  return clientIdParamSchema.safeParse(params);
};

/**
 * Validate client list query parameters
 */
export const validateClientListQuery = (query: unknown) => {
  return clientListQuerySchema.safeParse(query);
};

/**
 * Check if client data has required application fields
 */
export const hasRequiredApplicationFields = (data: any): boolean => {
  return !!data.companyName && !!data.contactEmail && !!data.contactPhone && !!data.country;
};

/**
 * Check if client data has valid update fields
 */
export const hasValidUpdateFields = (data: any): boolean => {
  const validFields = [
    'companyName',
    'contactEmail',
    'contactPhone',
    'country',
    'legalEntityNumber',
    'walletAddress',
    'logoUrl'
  ];
  
  return Object.keys(data).every(key => validFields.includes(key));
};