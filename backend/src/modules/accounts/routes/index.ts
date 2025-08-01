/**
 * Accounts Module Routes
 * Registers and exports all routes for the accounts module
 */

import { Router } from 'express';
import { authRouter } from './auth.routes';
import { createKycRoutes } from './kyc.routes';
import { KycController } from '../controllers/kyc.controller';
import { kycService } from '../services/kyc.service';

/**
 * Register all accounts routes
 * @returns Express router with all accounts routes mounted
 */
export function registerAccountsRoutes(): Router {
  const router = Router();
  
  // Create KYC controller and routes using the static factory method
  const kycController = KycController.getInstance();
  const kycRouter = createKycRoutes(kycController);
  
  // Mount routes
  router.use('/auth', authRouter);
  router.use('/kyc', kycRouter);
  
  return router;
}

// Export individual routers
export { authRouter } from './auth.routes';
export { createKycRoutes } from './kyc.routes';

