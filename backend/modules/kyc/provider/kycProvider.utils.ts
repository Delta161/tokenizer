import crypto from 'crypto';
import { KycStatus } from '../types/kyc.types.js';
import { ProviderStatusMapping, KycProvider, WebhookVerificationResult, KycProviderWebhookPayload } from './kycProvider.types.js';

// Mock API keys for development (in production, these would be in environment variables)
const PROVIDER_API_KEYS: Record<string, string> = {
  [KycProvider.SUMSUB]: 'mock_sumsub_api_key',
};

// Mock webhook secrets for development (in production, these would be in environment variables)
const PROVIDER_WEBHOOK_SECRETS: Record<string, string> = {
  [KycProvider.SUMSUB]: 'mock_sumsub_webhook_secret',
};

/**
 * Status mappings for different providers
 */
export const PROVIDER_STATUS_MAPPINGS: Record<string, ProviderStatusMapping> = {
  [KycProvider.SUMSUB]: {
    'pending': KycStatus.PENDING,
    'queued': KycStatus.PENDING,
    'prechecked': KycStatus.PENDING,
    'onHold': KycStatus.PENDING,
    'approved': KycStatus.VERIFIED,
    'verified': KycStatus.VERIFIED,
    'rejected': KycStatus.REJECTED,
    'failed': KycStatus.REJECTED,
  },
};

/**
 * Get API key for a provider
 */
export function getProviderApiKey(provider: KycProvider): string {
  const apiKey = PROVIDER_API_KEYS[provider];
  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}`);
  }
  return apiKey;
}

/**
 * Get webhook secret for a provider
 */
export function getProviderWebhookSecret(provider: KycProvider): string {
  const secret = PROVIDER_WEBHOOK_SECRETS[provider];
  if (!secret) {
    throw new Error(`Webhook secret not found for provider: ${provider}`);
  }
  return secret;
}

/**
 * Map provider status to internal KYC status
 */
export function mapProviderStatus(provider: KycProvider, providerStatus: string): KycStatus {
  const statusMapping = PROVIDER_STATUS_MAPPINGS[provider];
  if (!statusMapping) {
    throw new Error(`Status mapping not found for provider: ${provider}`);
  }

  const mappedStatus = statusMapping[providerStatus.toLowerCase()];
  return mappedStatus || KycStatus.PENDING; // Default to PENDING if status is unknown
}

/**
 * Verify Sumsub webhook signature
 */
export function verifySumsubWebhookSignature(headers: Record<string, string>, body: string): WebhookVerificationResult {
  try {
    const signature = headers['x-payload-digest'];
    if (!signature) {
      return { isValid: false, error: 'Missing signature header' };
    }

    const secret = getProviderWebhookSecret(KycProvider.SUMSUB);
    const hmac = crypto.createHmac('sha1', secret);
    const calculatedSignature = hmac.update(body).digest('hex');

    if (calculatedSignature !== signature) {
      return { isValid: false, error: 'Invalid signature' };
    }

    const payload = JSON.parse(body) as KycProviderWebhookPayload;
    return { isValid: true, payload };
  } catch (error) {
    return { isValid: false, error: `Signature verification failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Generate a unique reference ID for provider
 */
export function generateReferenceId(userId: string, provider: KycProvider): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${provider}_${userId}_${timestamp}_${randomString}`;
}