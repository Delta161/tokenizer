import { KycProvider, KycProviderSession, KycVerificationResult } from './kycProvider.types.js';
import { KycStatus } from '../types/kyc.types.js';
import { generateReferenceId } from './kycProvider.utils.js';

/**
 * Generate a mock KYC provider session
 */
export function generateMockSession(userId: string, provider: KycProvider, redirectUrl: string): KycProviderSession {
  const referenceId = generateReferenceId(userId, provider);
  
  // Create expiration date 1 hour from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  
  return {
    userId,
    redirectUrl: `https://mock-kyc-provider.example.com/${provider}/verification?reference=${referenceId}&redirect=${encodeURIComponent(redirectUrl)}`,
    expiresAt,
    referenceId
  };
}

/**
 * Generate a mock verification result
 * For testing, we'll simulate different results based on the referenceId
 */
export function generateMockVerificationResult(referenceId: string): KycVerificationResult {
  // Use the last character of the referenceId to determine the result
  // This allows for predictable testing
  const lastChar = referenceId.slice(-1);
  
  // If last character is 0-3, return PENDING
  // If last character is 4-7, return VERIFIED
  // If last character is 8-9, return REJECTED
  const charCode = lastChar.charCodeAt(0);
  
  if (charCode % 10 <= 3) {
    return {
      status: KycStatus.PENDING,
      referenceId,
      providerData: {
        reviewStatus: 'pending',
        applicantId: `mock-applicant-${referenceId}`,
        createdAt: new Date().toISOString(),
      }
    };
  } else if (charCode % 10 <= 7) {
    return {
      status: KycStatus.VERIFIED,
      referenceId,
      providerData: {
        reviewStatus: 'approved',
        applicantId: `mock-applicant-${referenceId}`,
        createdAt: new Date().toISOString(),
        reviewDate: new Date().toISOString(),
        reviewResult: {
          reviewAnswer: 'GREEN',
          label: 'APPROVED',
          rejectLabels: [],
        }
      }
    };
  } else {
    return {
      status: KycStatus.REJECTED,
      referenceId,
      rejectionReason: 'Document authenticity could not be verified',
      providerData: {
        reviewStatus: 'rejected',
        applicantId: `mock-applicant-${referenceId}`,
        createdAt: new Date().toISOString(),
        reviewDate: new Date().toISOString(),
        reviewResult: {
          reviewAnswer: 'RED',
          label: 'REJECTED',
          rejectLabels: ['DOCUMENT_VALIDITY'],
          rejectReasons: ['Document authenticity could not be verified']
        }
      }
    };
  }
}

/**
 * Generate a mock webhook payload
 */
export function generateMockWebhookPayload(referenceId: string): string {
  const result = generateMockVerificationResult(referenceId);
  
  return JSON.stringify({
    type: 'applicantReviewed',
    referenceId,
    status: result.status === KycStatus.VERIFIED ? 'approved' : 
            result.status === KycStatus.REJECTED ? 'rejected' : 'pending',
    reviewAnswer: result.status === KycStatus.VERIFIED ? 'GREEN' : 
                  result.status === KycStatus.REJECTED ? 'RED' : 'PENDING',
    rejectReason: result.rejectionReason,
    createdAt: new Date().toISOString(),
    metadata: result.providerData
  });
}