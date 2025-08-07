// External packages
import { z } from 'zod';

// Internal modules
import { KycStatus } from '../types/kyc.types';

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
    message: 'Status must be PENDING, VERIFIED, or REJECTED'
  }),
  rejectionReason: z.string().max(500).optional().nullable()
});

// Add a superRefine to validate the relationship between status and rejectionReason
export const KycUpdateSchemaWithRefinement = KycUpdateSchema.superRefine((data, ctx) => {
  if (data.status === KycStatus.REJECTED && !data.rejectionReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rejection reason is required when status is REJECTED',
      path: ['rejectionReason']
    });
  }
});
