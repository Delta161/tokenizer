import { PrismaClient } from '@prisma/client';
import { createKycRoutes } from './kyc.routes';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { requireKycVerified } from './kyc.middleware';
import { KycStatus } from './kyc.types';
import { initKycProviderModule, KycProvider, KycProviderService } from './provider';
/**
 * Initialize the KYC module
 * @param prisma PrismaClient instance (optional, will create new instance if not provided)
 * @returns Object containing routes and services
 */
export declare function initKycModule(prisma?: PrismaClient): {
    routes: ReturnType<typeof createKycRoutes>;
    service: KycService;
    controller: KycController;
    providerRoutes: ReturnType<typeof initKycProviderModule>['routes'];
    webhookRoutes: ReturnType<typeof initKycProviderModule>['webhookRoutes'];
    providerService: ReturnType<typeof initKycProviderModule>['service'];
};
export { KycStatus };
export { requireKycVerified };
export { KycService };
export { KycController };
export { KycProvider };
export { KycProviderService };
export default createKycRoutes;
//# sourceMappingURL=index.d.ts.map