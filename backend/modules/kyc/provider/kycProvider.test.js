import { PrismaClient } from '@prisma/client';
import { KycProviderService } from './kycProvider.service.js';
import { KycProvider } from './kycProvider.types.js';
import { verifySumsubWebhookSignature } from './kycProvider.utils.js';
import { generateMockWebhookPayload } from './kycProvider.mock.js';
import { logger } from '../../../utils/logger.js';

/**
 * This file demonstrates how to use the KYC provider module
 * It can be run with: node --experimental-modules kycProvider.test.js
 */

async function testKycProviderModule() {
  logger.info('Testing KYC Provider Module...');
  
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Initialize KYC provider service
    const kycProviderService = new KycProviderService(prisma);
    
    // Test user ID (should exist in your database)
    const userId = 'test-user-id';
    
    // Step 1: Initialize verification
    logger.info('\n1. Initializing verification session...');
    const session = await kycProviderService.initVerification(
      userId,
      KycProvider.SUMSUB,
      'https://example.com/callback'
    );
    
    logger.info('Session created:', {
      redirectUrl: session.redirectUrl,
      referenceId: session.referenceId,
      expiresAt: session.expiresAt
    });
    
    // Step 2: Get verification status
    logger.info('\n2. Getting verification status...');
    const status = await kycProviderService.getVerificationStatus(
      session.referenceId,
      KycProvider.SUMSUB
    );
    
    logger.info('Verification status:', {
      status: status.status,
      referenceId: status.referenceId,
      rejectionReason: status.rejectionReason || 'N/A'
    });
    
    // Step 3: Simulate webhook
    logger.info('\n3. Simulating webhook...');
    
    // Generate mock webhook payload
    const mockPayload = generateMockWebhookPayload(session.referenceId);
    
    // Verify webhook signature
    const headers = {
      'x-payload-digest': verifySumsubWebhookSignature(
        {}, // Empty headers for test
        mockPayload
      ).payload?.referenceId ? 'valid-signature' : 'invalid-signature'
    };
    
    const verificationResult = kycProviderService.verifyWebhookSignature(
      KycProvider.SUMSUB,
      headers,
      mockPayload
    );
    
    logger.info('Webhook verification:', {
      isValid: verificationResult.isValid
    });
    
    if (verificationResult.isValid && verificationResult.payload) {
      logger.info('Webhook payload:', {
        type: verificationResult.payload.type,
        status: verificationResult.payload.status
      });
      
      // Process webhook
      const updatedRecord = await kycProviderService.processWebhook(
        KycProvider.SUMSUB,
        verificationResult.payload
      );
      
      logger.info('KYC record updated:', {
        userId: updatedRecord?.userId,
        status: updatedRecord?.status,
        provider: updatedRecord?.provider,
        referenceId: updatedRecord?.referenceId
      });
    } else {
      logger.warn('Webhook verification failed:', {
        error: verificationResult.error
      });
    }
    
    // Step 4: Sync KYC status
    logger.info('\n4. Syncing KYC status...');
    const syncedRecord = await kycProviderService.syncKycStatus(userId);
    
    logger.info('Synced KYC record:', {
      userId: syncedRecord?.userId,
      status: syncedRecord?.status,
      provider: syncedRecord?.provider,
      referenceId: syncedRecord?.referenceId
    });
    
    logger.info('Test completed successfully!');
  } catch (error) {
    logger.error('Error testing KYC provider module:', {}, error);
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
    logger.info('Prisma client disconnected');
  }
}

// Run the test
testKycProviderModule();