import { KycProvider, KycProviderSession, KycVerificationResult } from './kycProvider.types.js';
/**
 * Generate a mock KYC provider session
 */
export declare function generateMockSession(userId: string, provider: KycProvider, redirectUrl: string): KycProviderSession;
/**
 * Generate a mock verification result
 * For testing, we'll simulate different results based on the referenceId
 */
export declare function generateMockVerificationResult(referenceId: string): KycVerificationResult;
/**
 * Generate a mock webhook payload
 */
export declare function generateMockWebhookPayload(referenceId: string): string;
//# sourceMappingURL=kycProvider.mock.d.ts.map