import { KycStatus } from '../types/kyc.types.js';
import { ProviderStatusMapping, KycProvider, WebhookVerificationResult } from './kycProvider.types.js';
/**
 * Status mappings for different providers
 */
export declare const PROVIDER_STATUS_MAPPINGS: Record<string, ProviderStatusMapping>;
/**
 * Get API key for a provider
 */
export declare function getProviderApiKey(provider: KycProvider): string;
/**
 * Get webhook secret for a provider
 */
export declare function getProviderWebhookSecret(provider: KycProvider): string;
/**
 * Map provider status to internal KYC status
 */
export declare function mapProviderStatus(provider: KycProvider, providerStatus: string): KycStatus;
/**
 * Verify Sumsub webhook signature
 */
export declare function verifySumsubWebhookSignature(headers: Record<string, string>, body: string): WebhookVerificationResult;
/**
 * Generate a unique reference ID for provider
 */
export declare function generateReferenceId(userId: string, provider: KycProvider): string;
//# sourceMappingURL=kycProvider.utils.d.ts.map