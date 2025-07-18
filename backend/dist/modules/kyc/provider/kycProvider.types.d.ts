import { KycStatus } from '../types/kyc.types.js';
/**
 * Supported KYC providers
 */
export declare enum KycProvider {
    SUMSUB = "sumsub"
}
/**
 * Provider session data
 */
export interface KycProviderSession {
    userId: string;
    redirectUrl: string;
    expiresAt: Date;
    referenceId: string;
}
/**
 * Provider webhook payload
 */
export interface KycProviderWebhookPayload {
    type: string;
    referenceId: string;
    status: string;
    reviewAnswer?: string;
    rejectReason?: string;
    createdAt: string;
    metadata?: Record<string, any>;
}
/**
 * Provider webhook verification result
 */
export interface WebhookVerificationResult {
    isValid: boolean;
    payload?: KycProviderWebhookPayload;
    error?: string;
}
/**
 * Provider status mapping
 */
export interface ProviderStatusMapping {
    [key: string]: KycStatus;
}
/**
 * Provider verification result
 */
export interface KycVerificationResult {
    status: KycStatus;
    referenceId: string;
    providerData: Record<string, any>;
    rejectionReason?: string;
}
/**
 * KYC provider adapter interface
 */
export interface KycProviderAdapter {
    /**
     * Initialize a KYC verification session
     */
    initVerification(userId: string, redirectUrl: string): Promise<KycProviderSession>;
    /**
     * Get verification status from provider
     */
    getVerificationStatus(referenceId: string): Promise<KycVerificationResult>;
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(headers: Record<string, string>, body: string): WebhookVerificationResult;
    /**
     * Process webhook payload
     */
    processWebhookPayload(payload: KycProviderWebhookPayload): KycVerificationResult;
}
//# sourceMappingURL=kycProvider.types.d.ts.map