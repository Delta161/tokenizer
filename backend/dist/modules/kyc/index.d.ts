import { PrismaClient } from '@prisma/client';
import { KycController } from './controllers/kyc.controller.js';
import { KycService } from './services/kyc.service.js';
import { requireKycVerified } from './middleware/requireKycVerified.js';
import { KycStatus } from './types/kyc.types.js';
import { KycProvider, KycProviderService } from './provider/index.js';
/**
 * Initialize the KYC module
 * @param prisma PrismaClient instance
 * @returns Object containing routes and services
 */
export declare function initKycModule(prisma: PrismaClient): {
    routes: import("express").Router;
    service: KycService;
    controller: KycController;
    providerRoutes: import("express").Router;
    webhookRoutes: import("express").Router;
    providerService: KycProviderService;
};
export { KycStatus };
export { requireKycVerified };
export { KycService };
export { KycController };
export { KycProvider };
export { KycProviderService };
//# sourceMappingURL=index.d.ts.map