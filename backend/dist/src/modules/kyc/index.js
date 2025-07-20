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
export function initKycModule(prisma) {
    // Use provided prisma instance or create a new one
    const prismaInstance = prisma || new PrismaClient();
    const kycService = new KycService(prismaInstance);
    const kycController = new KycController(kycService);
    const kycRoutes = createKycRoutes(kycController);
    // Initialize KYC provider submodule
    const kycProviderModule = initKycProviderModule(prismaInstance);
    return {
        routes: kycRoutes,
        service: kycService,
        controller: kycController,
        providerRoutes: kycProviderModule.routes,
        webhookRoutes: kycProviderModule.webhookRoutes,
        providerService: kycProviderModule.service
    };
}
// Export types and middleware
export { KycStatus };
export { requireKycVerified };
export { KycService };
export { KycController };
export { KycProvider };
export { KycProviderService };
// Default export for convenience
export default createKycRoutes;
//# sourceMappingURL=index.js.map