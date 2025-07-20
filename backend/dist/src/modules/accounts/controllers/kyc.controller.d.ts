import { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '@modules/accounts/middleware/auth.middleware';
import { KycService } from '@modules/accounts/services/kyc.service';
export declare class KycController {
    private kycService;
    constructor(kycService: KycService);
    /**
     * Get current user's KYC record
     */
    getCurrentUserKyc: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Initiate KYC verification with a provider
     */
    initiateProviderVerification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Sync KYC status from provider (admin only)
     */
    syncKycStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Submit KYC information
     */
    submitKyc: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get all KYC records (admin only)
     */
    getAllKycRecords: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get KYC record for a specific user (admin only)
     */
    getUserKyc: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Update KYC status (admin only)
     */
    updateKycStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const kycController: KycController;
//# sourceMappingURL=kyc.controller.d.ts.map