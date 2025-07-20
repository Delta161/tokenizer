import { z } from 'zod';
import type { KycStatus } from '@modules/accounts/types/kyc.types';
/**
 * Validator for KYC submission data
 */
export declare const KycSubmissionSchema: z.ZodObject<{
    documentType: z.ZodString;
    country: z.ZodString;
}, z.core.$strip>;
/**
 * Validator for KYC status update by admin
 */
export declare const KycUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: KycStatus.PENDING;
        VERIFIED: KycStatus.VERIFIED;
        REJECTED: KycStatus.REJECTED;
    }>;
    rejectionReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=kyc.validator.d.ts.map