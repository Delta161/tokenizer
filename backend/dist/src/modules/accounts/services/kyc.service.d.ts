import { KycRecord, PrismaClient } from '@prisma/client';
import type { KycProvider, KycProviderSession, KycRecordWithUser, KycSubmissionData, KycUpdateData } from '@modules/accounts/types/kyc.types';
export declare class KycService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Get KYC record for a user
     * @param userId User ID
     * @returns KYC record or null if not found
     */
    getByUserId(userId: string): Promise<KycRecord | null>;
    /**
     * Submit or update KYC information for a user
     * @param userId User ID
     * @param data KYC submission data
     * @returns Created or updated KYC record
     */
    submitKyc(userId: string, data: KycSubmissionData): Promise<KycRecord>;
    /**
     * Update KYC status (admin only)
     * @param userId User ID
     * @param data KYC update data
     * @returns Updated KYC record
     */
    updateKycStatus(userId: string, data: KycUpdateData): Promise<KycRecord>;
    /**
     * Get all KYC records (admin only)
     * @returns List of KYC records with user information
     */
    getAllKycRecords(): Promise<KycRecordWithUser[]>;
    /**
     * Check if a user has verified KYC
     * @param userId User ID
     * @returns Boolean indicating if user has verified KYC
     */
    isKycVerified(userId: string): Promise<boolean>;
    /**
     * Initiate KYC verification with a provider
     * @param userId User ID
     * @param provider KYC provider
     * @param redirectUrl URL to redirect after verification
     * @returns Provider session information
     */
    initiateProviderVerification(userId: string, provider: KycProvider, redirectUrl: string): Promise<KycProviderSession>;
    /**
     * Sync KYC status from provider
     * @param userId User ID
     * @returns Updated KYC record
     */
    syncKycStatus(userId: string): Promise<KycRecord | null>;
}
export declare const kycService: KycService;
//# sourceMappingURL=kyc.service.d.ts.map