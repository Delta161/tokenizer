import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { KycProviderService } from './kycProvider.service.js';
import { KycProviderController } from './kycProvider.controller.js';
import { createKycProviderRoutes } from './kycProvider.routes.js';
import { createWebhookRoutes } from './webhook.routes.js';
import { KycProvider } from './kycProvider.types.js';

/**
 * Initialize KYC provider module
 */
export function initKycProviderModule(prisma: PrismaClient): {
  routes: Router;
  webhookRoutes: Router;
  service: KycProviderService;
  controller: KycProviderController;
} {
  // Initialize services
  const kycProviderService = new KycProviderService(prisma);
  
  // Initialize controllers
  const kycProviderController = new KycProviderController(kycProviderService);
  
  // Initialize routes
  const routes = createKycProviderRoutes(kycProviderController);
  const webhookRoutes = createWebhookRoutes(kycProviderController);
  
  return {
    routes,
    webhookRoutes,
    service: kycProviderService,
    controller: kycProviderController
  };
}

// Export types and utilities
export { KycProvider };
export { KycProviderService };
export { KycProviderController };