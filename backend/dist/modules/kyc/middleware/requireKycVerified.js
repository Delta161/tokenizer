import { PrismaClient } from '@prisma/client';
import { KycService } from '../services/kyc.service.js';
const prisma = new PrismaClient();
const kycService = new KycService(prisma);
/**
 * Middleware to require verified KYC status
 * This middleware should be used after requireAuth
 */
export const requireKycVerified = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to access this resource'
            });
            return;
        }
        const isVerified = await kycService.isKycVerified(req.user.id);
        if (!isVerified) {
            res.status(403).json({
                success: false,
                error: 'KYC verification required',
                message: 'You must complete KYC verification to access this resource',
                kycStatus: 'NOT_VERIFIED'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('KYC verification middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred while checking KYC verification status'
        });
    }
};
//# sourceMappingURL=requireKycVerified.js.map