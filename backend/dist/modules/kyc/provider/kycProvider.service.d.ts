import { PrismaClient, KycRecord } from '@prisma/client';
import { KycProvider, KycProviderSession, KycVerificationResult, WebhookVerificationResult, KycProviderWebhookPayload } from './kycProvider.types.js';
/**
 * KYC Provider Service
 */
export declare class KycProviderService {
    private prisma;
    private providers;
    constructor(prisma: PrismaClient);
    /**
     * Get provider adapter by name
     */
    private getProviderAdapter;
    /**
     * Initialize a KYC verification session
     */
    initVerification(userId: string, provider: KycProvider, redirectUrl: string): Promise<KycProviderSession>;
    /**
     * Get verification status from provider
     */
    getVerificationStatus(referenceId: string, provider: KycProvider): Promise<KycVerificationResult>;
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(provider: KycProvider, headers: Record<string, string>, body: string): WebhookVerificationResult;
    /**
     * Process webhook payload and update KYC record
     */
    processWebhook(provider: KycProvider, payload: KycProviderWebhookPayload): Promise<KycRecord | null>;
    /**
     * Get KYC record by reference ID
     */
    getKycRecordByReferenceId(referenceId: string): Promise<KycRecord | null>;
    /**
     * Manually sync KYC status from provider
     * Useful for admin operations or debugging
     */
    syncKycStatus(userId: string): Promise<KycRecord | null>;
}
//# sourceMappingURL=kycProvider.service.d.ts.map