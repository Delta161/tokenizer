import { PrismaClient } from '@prisma/client';
import { createKycRoutes } from './routes/kyc.routes.js';
import { KycController } from './controllers/kyc.controller.js';
import { KycService } from './services/kyc.service.js';
import { requireKycVerified } from './middleware/requireKycVerified.js';
import { KycStatus } from './types/kyc.types.js';
import { initKycProviderModule, KycProvider, KycProviderService } from './provider/index.js';

/**
 * Initialize the KYC module
 * @param prisma PrismaClient instance
 * @returns Object containing routes and services
 */
export function initKycModule(prisma: PrismaClient): {
  routes: ReturnType<typeof createKycRoutes>;
  service: KycService;
  controller: KycController;
  providerRoutes: ReturnType<typeof initKycProviderModule>['routes'];
  webhookRoutes: ReturnType<typeof initKycProviderModule>['webhookRoutes'];
  providerService: ReturnType<typeof initKycProviderModule>['service'];
} {
  const kycRoutes = createKycRoutes(prisma);
  const kycService = new KycService(prisma);
  const kycController = new KycController(prisma);
  
  // Initialize KYC provider submodule
  const kycProviderModule = initKycProviderModule(prisma);

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