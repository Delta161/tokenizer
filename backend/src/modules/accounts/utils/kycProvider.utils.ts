/**
 * KYC Provider Utilities
 * Helper functions for KYC provider integrations
 */

// External packages
import crypto from 'crypto';

/**
 * Verify Sumsub webhook signature
 * @param payload Raw request body as string
 * @param signature Signature from x-payload-digest header
 * @returns Boolean indicating if signature is valid
 */
export const verifySumsubWebhookSignature = (payload: string, signature: string): boolean => {
  // Get webhook secret from environment variables
  const webhookSecret = process.env.SUMSUB_WEBHOOK_SECRET || 'mock_sumsub_webhook_secret';
  
  // Calculate expected signature
  const hmac = crypto.createHmac('sha1', webhookSecret);
  const expectedSignature = hmac.update(payload).digest('hex');
  
  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
};

/**
 * Map Sumsub status to internal KYC status
 * @param sumsubStatus Status from Sumsub webhook
 * @returns Internal KYC status
 */
export const mapSumsubStatusToKycStatus = (sumsubStatus: string): string => {
  const statusMap: Record<string, string> = {
    'approved': 'VERIFIED',
    'rejected': 'REJECTED',
    'pending': 'PENDING'
  };
  
  return statusMap[sumsubStatus] || 'PENDING';
};