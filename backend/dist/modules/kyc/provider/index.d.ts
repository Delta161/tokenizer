import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { KycProviderService } from './kycProvider.service.js';
import { KycProviderController } from './kycProvider.controller.js';
import { KycProvider } from './kycProvider.types.js';
/**
 * Initialize KYC provider module
 */
export declare function initKycProviderModule(prisma: PrismaClient): {
    routes: Router;
    webhookRoutes: Router;
    service: KycProviderService;
    controller: KycProviderController;
};
export { KycProvider };
export { KycProviderService };
export { KycProviderController };
//# sourceMappingURL=index.d.ts.map