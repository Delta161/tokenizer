/**
 * KYC Utilities
 * Helper functions for KYC-related operations
 */
import type { KycRecord } from '@prisma/client';
import type { KycStatus, KycRecordDTO } from '@modules/accounts/types/kyc.types';
/**
 * Map Prisma KycRecord model to KycRecordDTO
 * @param record Prisma KycRecord model
 * @returns KYC record DTO
 */
export declare const mapKycRecordToDTO: (record: KycRecord) => KycRecordDTO;
/**
 * Check if KYC status is verified
 * @param status KYC status
 * @returns True if status is verified, false otherwise
 */
export declare const isKycVerified: (status: KycStatus) => boolean;
/**
 * Format country code to country name
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns Country name or original code if not found
 */
export declare const formatCountryName: (countryCode: string) => string;
//# sourceMappingURL=kyc.utils.d.ts.map