import { Request, Response } from 'express';
import { KycProviderService } from './kycProvider.service.js';
export declare class KycProviderController {
    private kycProviderService;
    constructor(kycProviderService: KycProviderService);
    /**
     * Initiate KYC verification with a provider
     */
    initiateVerification: (req: Request, res: Response) => Promise<void>;
    /**
     * Handle webhook from KYC provider
     */
    handleWebhook: (req: Request, res: Response) => Promise<void>;
    /**
     * Get KYC verification status (admin only)
     */
    getVerificationStatus: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=kycProvider.controller.d.ts.map