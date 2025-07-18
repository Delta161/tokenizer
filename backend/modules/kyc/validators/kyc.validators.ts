import { z } from 'zod';
import { KycStatus } from '../types/kyc.types.js';

/**
 * Validator for KYC submission data
 */
export const KycSubmissionSchema = z.object({
  documentType: z.string().max(50, 'Document type must be 50 characters or less'),
  country: z.string().length(2, 'Country must be a 2-character ISO country code')
});

/**
 * Validator for KYC status update by admin
 */
export const KycUpdateSchema = z.object({
  status: z.enum([KycStatus.PENDING, KycStatus.VERIFIED, KycStatus.REJECTED], {
    errorMap: () => ({ message: 'Status must be PENDING, VERIFIED, or REJECTED' })
  }),
  rejectionReason: z.string().max(500).optional().nullable()
    .refine(
      (val) => !(val === undefined && KycStatus.REJECTED),
      'Rejection reason is required when status is REJECTED'
    )
});