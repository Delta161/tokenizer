// External packages
import { PrismaClient } from '@prisma/client';
export class KycService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get KYC record for a user
     * @param userId User ID
     * @returns KYC record or null if not found
     */
    async getByUserId(userId) {
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
    async submitKyc(userId, data) {
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
    async updateKycStatus(userId, data) {
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
    async getAllKycRecords() {
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
    async isKycVerified(userId) {
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
    async initiateProviderVerification(userId, provider, redirectUrl) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // This is a placeholder - in the actual implementation, we would call a provider service
        // For now, we'll return a mock session
        return {
            redirectUrl: `https://kyc-provider.example.com/verify?userId=${userId}&provider=${provider}&redirect=${encodeURIComponent(redirectUrl)}`,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
            referenceId: `kyc-${userId}-${Date.now()}`
        };
    }
    /**
     * Sync KYC status from provider
     * @param userId User ID
     * @returns Updated KYC record
     */
    async syncKycStatus(userId) {
        // This is a placeholder - in the actual implementation, we would call a provider service
        // For now, we'll just return the current record
        return this.getByUserId(userId);
    }
}
// Create singleton instance
const prisma = new PrismaClient();
export const kycService = new KycService(prisma);
//# sourceMappingURL=kyc.service.js.map