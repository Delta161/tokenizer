import { PrismaClient, KycRecord } from '@prisma/client';
import { KycStatus, KycSubmissionData, KycUpdateData, KycRecordWithUser } from './kyc.types';
import { KycProvider, KycProviderService, KycProviderSession } from './provider';

export class KycService {
  private kycProviderService: KycProviderService;
  
  constructor(private prisma: PrismaClient) {
    this.kycProviderService = new KycProviderService(prisma);
  }

  /**
   * Get KYC record for a user
   * @param userId User ID
   * @returns KYC record or null if not found
   */
  async getByUserId(userId: string): Promise<KycRecord | null> {
    return this.prisma.kycRecord.findUnique({
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create or update KYC record
    return this.prisma.kycRecord.upsert({
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

    // Check if KYC record exists
    const existingRecord = await this.prisma.kycRecord.findUnique({
      where: { userId }
    });

    if (!existingRecord) {
      throw new Error('KYC record not found');
    }

    // Update KYC record based on status
    return this.prisma.kycRecord.update({
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
   * Get all KYC records (admin only)
   * @returns List of KYC records with user information
   */
  async getAllKycRecords(): Promise<KycRecordWithUser[]> {
    return this.prisma.kycRecord.findMany({
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
      }
    });
  }

  /**
   * Check if a user has verified KYC
   * @param userId User ID
   * @returns Boolean indicating if user has verified KYC
   */
  async isKycVerified(userId: string): Promise<boolean> {
    const kycRecord = await this.prisma.kycRecord.findUnique({
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }
    
    // Initialize verification with provider
    return this.kycProviderService.initVerification(userId, provider, redirectUrl);
  }
  
  /**
   * Sync KYC status from provider
   * @param userId User ID
   * @returns Updated KYC record
   */
  async syncKycStatus(userId: string): Promise<KycRecord | null> {
    return this.kycProviderService.syncKycStatus(userId);
  }
}