import { PrismaClient, KycRecord } from '@prisma/client';
import { KycProvider, KycProviderAdapter, KycProviderSession, KycVerificationResult, WebhookVerificationResult, KycProviderWebhookPayload } from './kycProvider.types.js';
import { KycStatus } from '../types/kyc.types.js';
import { generateMockSession, generateMockVerificationResult } from './kycProvider.mock.js';
import { verifySumsubWebhookSignature, mapProviderStatus } from './kycProvider.utils.js';
import { logger } from '../../../utils/logger.js';

/**
 * Sumsub KYC Provider Adapter
 */
class SumsubProviderAdapter implements KycProviderAdapter {
  constructor(private prisma: PrismaClient) {}

  async initVerification(userId: string, redirectUrl: string): Promise<KycProviderSession> {
    try {
      logger.info(`Initializing Sumsub verification for user ${userId}`);
      
      // In a real implementation, this would call the Sumsub API
      // For now, we'll use our mock implementation
      const session = generateMockSession(userId, KycProvider.SUMSUB, redirectUrl);
      
      // Update or create KYC record with provider information
      await this.prisma.kycRecord.upsert({
        where: { userId },
        create: {
          userId,
          status: KycStatus.PENDING,
          provider: KycProvider.SUMSUB,
          referenceId: session.referenceId,
          providerData: {}
        },
        update: {
          status: KycStatus.PENDING, // Reset to pending when starting a new verification
          provider: KycProvider.SUMSUB,
          referenceId: session.referenceId,
          rejectedAt: null,
          verifiedAt: null,
          rejectionReason: null
        }
      });
      
      return session;
    } catch (error) {
      logger.error(`Error initializing Sumsub verification: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to initialize KYC verification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getVerificationStatus(referenceId: string): Promise<KycVerificationResult> {
    try {
      logger.info(`Getting verification status for reference ${referenceId}`);
      
      // In a real implementation, this would call the Sumsub API
      // For now, we'll use our mock implementation
      return generateMockVerificationResult(referenceId);
    } catch (error) {
      logger.error(`Error getting verification status: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to get verification status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  verifyWebhookSignature(headers: Record<string, string>, body: string): WebhookVerificationResult {
    return verifySumsubWebhookSignature(headers, body);
  }

  processWebhookPayload(payload: KycProviderWebhookPayload): KycVerificationResult {
    try {
      logger.info(`Processing Sumsub webhook for reference ${payload.referenceId}`);
      
      const status = mapProviderStatus(KycProvider.SUMSUB, payload.status);
      
      return {
        status,
        referenceId: payload.referenceId,
        providerData: payload.metadata || {},
        rejectionReason: payload.rejectReason
      };
    } catch (error) {
      logger.error(`Error processing webhook payload: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to process webhook payload: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * KYC Provider Service
 */
export class KycProviderService {
  private providers: Map<KycProvider, KycProviderAdapter>;

  constructor(private prisma: PrismaClient) {
    // Initialize provider adapters
    this.providers = new Map();
    this.providers.set(KycProvider.SUMSUB, new SumsubProviderAdapter(prisma));
  }

  /**
   * Get provider adapter by name
   */
  private getProviderAdapter(provider: KycProvider): KycProviderAdapter {
    const adapter = this.providers.get(provider);
    if (!adapter) {
      throw new Error(`Provider not supported: ${provider}`);
    }
    return adapter;
  }

  /**
   * Initialize a KYC verification session
   */
  async initVerification(userId: string, provider: KycProvider, redirectUrl: string): Promise<KycProviderSession> {
    const adapter = this.getProviderAdapter(provider);
    return adapter.initVerification(userId, redirectUrl);
  }

  /**
   * Get verification status from provider
   */
  async getVerificationStatus(referenceId: string, provider: KycProvider): Promise<KycVerificationResult> {
    const adapter = this.getProviderAdapter(provider);
    return adapter.getVerificationStatus(referenceId);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(provider: KycProvider, headers: Record<string, string>, body: string): WebhookVerificationResult {
    const adapter = this.getProviderAdapter(provider);
    return adapter.verifyWebhookSignature(headers, body);
  }

  /**
   * Process webhook payload and update KYC record
   */
  async processWebhook(provider: KycProvider, payload: KycProviderWebhookPayload): Promise<KycRecord | null> {
    try {
      const adapter = this.getProviderAdapter(provider);
      const result = adapter.processWebhookPayload(payload);
      
      // Find KYC record by referenceId
      const kycRecord = await this.prisma.kycRecord.findFirst({
        where: { referenceId: result.referenceId }
      });
      
      if (!kycRecord) {
        logger.warn(`KYC record not found for reference ID: ${result.referenceId}`);
        return null;
      }
      
      // Update KYC record based on verification result
      const now = new Date();
      const updateData: {
        status: KycStatus;
        providerData: Record<string, unknown>;
        updatedAt: Date;
        verifiedAt?: Date | null;
        rejectedAt?: Date | null;
        rejectionReason?: string | null;
      } = {
        status: result.status,
        providerData: result.providerData,
        updatedAt: now
      };
      
      if (result.status === KycStatus.VERIFIED) {
        updateData.verifiedAt = now;
        updateData.rejectedAt = null;
        updateData.rejectionReason = null;
      } else if (result.status === KycStatus.REJECTED) {
        updateData.rejectedAt = now;
        updateData.verifiedAt = null;
        updateData.rejectionReason = result.rejectionReason;
      }
      
      return this.prisma.kycRecord.update({
        where: { id: kycRecord.id },
        data: updateData
      });
    } catch (error) {
      logger.error(`Error processing webhook: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to process webhook: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get KYC record by reference ID
   */
  async getKycRecordByReferenceId(referenceId: string): Promise<KycRecord | null> {
    return this.prisma.kycRecord.findFirst({
      where: { referenceId }
    });
  }

  /**
   * Manually sync KYC status from provider
   * Useful for admin operations or debugging
   */
  async syncKycStatus(userId: string): Promise<KycRecord | null> {
    try {
      // Find the user's KYC record
      const kycRecord = await this.prisma.kycRecord.findUnique({
        where: { userId }
      });
      
      if (!kycRecord || !kycRecord.provider || !kycRecord.referenceId) {
        logger.warn(`No valid KYC record found for user: ${userId}`);
        return null;
      }
      
      // Get current status from provider
      const provider = kycRecord.provider as KycProvider;
      const result = await this.getVerificationStatus(kycRecord.referenceId, provider);
      
      // Update KYC record based on verification result
      const now = new Date();
      const updateData: {
        status: KycStatus;
        providerData: Record<string, unknown>;
        updatedAt: Date;
        verifiedAt?: Date | null;
        rejectedAt?: Date | null;
        rejectionReason?: string | null;
      } = {
        status: result.status,
        providerData: result.providerData,
        updatedAt: now
      };
      
      if (result.status === KycStatus.VERIFIED) {
        updateData.verifiedAt = now;
        updateData.rejectedAt = null;
        updateData.rejectionReason = null;
      } else if (result.status === KycStatus.REJECTED) {
        updateData.rejectedAt = now;
        updateData.verifiedAt = null;
        updateData.rejectionReason = result.rejectionReason;
      }
      
      return this.prisma.kycRecord.update({
        where: { id: kycRecord.id },
        data: updateData
      });
    } catch (error) {
      logger.error(`Error syncing KYC status: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to sync KYC status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}