// External packages
import { KycRecord } from '@prisma/client';

// Internal modules
import { KycStatus,
  type KycProvider, 
  type KycProviderSession, 
  type KycRecordWithUser, 
  type KycSubmissionData, 
  type KycUpdateData 
} from '@modules/accounts/types/kyc.types';
import { createNotFound } from '@middleware/errorHandler';
import { getSkipValue } from '@utils/pagination';

// Shared Prisma client
import { prisma } from '../utils/prisma';

export class KycService {

  /**
   * Update KYC record by provider reference
   * @param provider KYC provider name
   * @param referenceId Provider reference ID
   * @param data Update data
   * @returns Updated KYC record
   */
  public async updateByProviderReference(
    provider: string,
    referenceId: string,
    data: KycUpdateData
  ): Promise<KycRecord | null> {
    try {
      // Find KYC record by provider and reference ID
      const kycRecord = await prisma.kycRecord.findFirst({
        where: {
          provider,
          referenceId // Using referenceId field from the schema instead of providerReference
        }
      });

      if (!kycRecord) {
        return null;
      }

      // Update KYC record
      const updatedRecord = await prisma.kycRecord.update({
        where: {
          id: kycRecord.id
        },
        data: {
          status: data.status,
          rejectionReason: data.rejectionReason,
          verifiedAt: data.status === KycStatus.VERIFIED ? new Date() : kycRecord.verifiedAt
        }
      });

      return updatedRecord;
    } catch (error) {
      // Use the logAccountError method instead of error directly
      console.error('Error in updateByProviderReference:', error, {
        provider,
        referenceId
      });
      throw error;
    }
  }

  /**
   * Get KYC record for a user
   * @param userId User ID
   * @returns KYC record or null if not found
   */
  async getByUserId(userId: string): Promise<KycRecord | null> {
    return prisma.kycRecord.findUnique({
      where: { userId }
    });
  }

  /**
   * Submit or update KYC information for a user
   * @param userId User ID
   * @param data KYC submission data
   * @returns Created or updated KYC record
   */
  async submitKyc(userId: string, data: KycSubmissionData): Promise<KycRecord> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createNotFound(
        'User not found',
        'USER_NOT_FOUND',
        { 
          userId,
          resource: 'user',
          suggestion: 'Verify the user ID is correct'
        }
      );
    }

    // Create or update KYC record
    return prisma.kycRecord.upsert({
      where: { userId },
      update: {
        ...data,
        status: KycStatus.PENDING, // Reset to pending if resubmitting
        rejectedAt: null,
        rejectionReason: null
      },
      create: {
        userId,
        ...data,
        status: KycStatus.PENDING
      }
    });
  }

  /**
   * Update KYC status (admin only)
   * @param userId User ID
   * @param data KYC update data
   * @returns Updated KYC record
   */
  async updateKycStatus(userId: string, data: KycUpdateData): Promise<KycRecord> {
    const { status, rejectionReason } = data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createNotFound(
        'User not found',
        'USER_NOT_FOUND',
        { 
          userId,
          resource: 'user',
          suggestion: 'Verify the user ID is correct'
        }
      );
    }

    // Check if KYC record exists
    const existingRecord = await prisma.kycRecord.findUnique({
      where: { userId }
    });

    if (!existingRecord) {
      throw createNotFound(
        'KYC record not found',
        'KYC_RECORD_NOT_FOUND',
        { 
          userId,
          resource: 'kycRecord',
          suggestion: 'The user may not have submitted KYC information yet'
        }
      );
    }

    // Update KYC record based on status
    return prisma.kycRecord.update({
      where: { userId },
      data: {
        status,
        // Set verification date if status is VERIFIED
        verifiedAt: status === KycStatus.VERIFIED ? new Date() : existingRecord.verifiedAt,
        // Set rejection date and reason if status is REJECTED
        rejectedAt: status === KycStatus.REJECTED ? new Date() : existingRecord.rejectedAt,
        rejectionReason: status === KycStatus.REJECTED ? rejectionReason : null
      }
    });
  }

  /**
   * Get all KYC records (admin only) with pagination
   * @param page Page number
   * @param limit Number of records per page
   * @returns List of KYC records with user information and total count
   */
  async getAllKycRecords(page: number = 1, limit: number = 10): Promise<{ kycRecords: KycRecordWithUser[], total: number }> {
    const skip = getSkipValue(page, limit);
    
    const [kycRecords, total] = await Promise.all([
      prisma.kycRecord.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.kycRecord.count()
    ]);
    
    return { kycRecords, total };
  }

  /**
   * Check if a user has verified KYC
   * @param userId User ID
   * @returns Boolean indicating if user has verified KYC
   */
  async isKycVerified(userId: string): Promise<boolean> {
    const kycRecord = await prisma.kycRecord.findUnique({
      where: { userId }
    });

    return kycRecord?.status === KycStatus.VERIFIED;
  }
  
  /**
   * Initiate KYC verification with a provider
   * @param userId User ID
   * @param provider KYC provider
   * @param redirectUrl URL to redirect after verification
   * @returns Provider session information
   */
  async initiateProviderVerification(userId: string, provider: KycProvider, redirectUrl: string): Promise<KycProviderSession> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createNotFound(
        'User not found',
        'USER_NOT_FOUND',
        { 
          userId,
          resource: 'user',
          suggestion: 'Verify the user ID is correct'
        }
      );
    }
    
    // This is a placeholder - in the actual implementation, we would call a provider service
    // For now, we'll return a mock session
    const kycProviderBaseUrl = process.env.KYC_PROVIDER_BASE_URL || 'https://kyc-provider.example.com';
    return {
      redirectUrl: `${kycProviderBaseUrl}/verify?userId=${userId}&provider=${provider}&redirect=${encodeURIComponent(redirectUrl)}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      referenceId: `kyc-${userId}-${Date.now()}`
    };
  }
  
  /**
   * Sync KYC status from provider
   * @param userId User ID
   * @returns Updated KYC record
   */
  async syncKycStatus(userId: string): Promise<KycRecord | null> {
    // This is a placeholder - in the actual implementation, we would call a provider service
    // For now, we'll just return the current record
    return this.getByUserId(userId);
  }
}

// Create singleton instance using the shared prisma client
export const kycService = new KycService();

