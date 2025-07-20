/**
 * KYC Utilities
 * Helper functions for KYC-related operations
 */
/**
 * Map Prisma KycRecord model to KycRecordDTO
 * @param record Prisma KycRecord model
 * @returns KYC record DTO
 */
export const mapKycRecordToDTO = (record) => {
    return {
        id: record.id,
        userId: record.userId,
        status: record.status,
        documentType: record.documentType,
        country: record.country,
        provider: record.provider,
        providerReference: record.providerReference,
        rejectionReason: record.rejectionReason,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        verifiedAt: record.verifiedAt
    };
};
/**
 * Check if KYC status is verified
 * @param status KYC status
 * @returns True if status is verified, false otherwise
 */
export const isKycVerified = (status) => {
    return status === KycStatus.VERIFIED;
};
/**
 * Format country code to country name
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns Country name or original code if not found
 */
export const formatCountryName = (countryCode) => {
    const countries = {
        'US': 'United States',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'ES': 'Spain',
        'IT': 'Italy',
        'JP': 'Japan',
        'CN': 'China',
        // Add more as needed
    };
    return countries[countryCode] || countryCode;
};
//# sourceMappingURL=kyc.utils.js.map