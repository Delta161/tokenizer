import { z } from 'zod';
import { Blockchain } from '@prisma/client';
import { PAGINATION } from '@config/constants';
import { isAddress } from 'ethers';

/**
 * Validation schema for investor application
 */
export const investorApplicationSchema = z.object({
  nationality: z.string().min(2, 'Nationality is required'),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  institutionName: z.string().optional(),
  vatNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().optional(),
});

/**
 * Validation schema for investor profile updates
 * At least one field must be provided
 */
export const investorUpdateSchema = z.object({
  nationality: z.string().min(2).optional(),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  institutionName: z.string().optional(),
  vatNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(2).optional(),
  postalCode: z.string().optional(),
}).refine(
  data => Object.values(data).some(val => val !== undefined),
  {
    message: 'At least one field must be provided for update',
  }
);

/**
 * Validation schema for investor verification status updates
 */
export const investorVerificationUpdateSchema = z.object({
  isVerified: z.boolean(),
  verificationMethod: z.string().optional(),
});

/**
 * Validation schema for wallet creation
 */
export const walletCreateSchema = z.object({
  address: z.string()
    .refine(val => isAddress(val), {
      message: 'Invalid Ethereum address format',
    }),
  blockchain: z.nativeEnum(Blockchain),
});

/**
 * Validation schema for wallet verification updates
 */
export const walletVerificationUpdateSchema = z.object({
  isVerified: z.boolean(),
});

/**
 * Validation schema for investor ID path parameter
 */
export const investorIdParamSchema = z.object({
  id: z.string().uuid('Invalid investor ID format'),
});

/**
 * Validation schema for wallet ID path parameter
 */
export const walletIdParamSchema = z.object({
  walletId: z.string().uuid('Invalid wallet ID format'),
});

/**
 * Validation schema for investor listing query parameters
 */
export const investorListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(100).default(PAGINATION.DEFAULT_LIMIT),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isVerified: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  country: z.string().optional(),
});

// Helper functions for safe parsing

export const parseInvestorApplication = (data: unknown) => {
  return investorApplicationSchema.safeParse(data);
};

export const parseInvestorUpdate = (data: unknown) => {
  return investorUpdateSchema.safeParse(data);
};

export const parseInvestorVerificationUpdate = (data: unknown) => {
  return investorVerificationUpdateSchema.safeParse(data);
};

export const parseWalletCreate = (data: unknown) => {
  return walletCreateSchema.safeParse(data);
};

export const parseWalletVerificationUpdate = (data: unknown) => {
  return walletVerificationUpdateSchema.safeParse(data);
};

export const parseInvestorIdParam = (data: unknown) => {
  return investorIdParamSchema.safeParse(data);
};

export const parseWalletIdParam = (data: unknown) => {
  return walletIdParamSchema.safeParse(data);
};

export const parseInvestorListQuery = (data: unknown) => {
  return investorListQuerySchema.safeParse(data);
};