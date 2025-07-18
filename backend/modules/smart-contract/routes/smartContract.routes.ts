import { Router } from 'express';
import { SmartContractController } from '../controllers/smartContract.controller.js';
import { requireAuth } from '../../auth/requireAuth.js';
import { requireRole } from '../../auth/requireRole.js';

export function smartContractRoutes(controller: SmartContractController): Router {
  const router = Router();

  // Public routes (no auth required)
  router.get('/validate/:contractAddress', controller.validateContract.bind(controller));
  router.get('/metadata/:contractAddress', controller.getTokenMetadata.bind(controller));
  router.get('/balance', controller.getBalanceOf.bind(controller));

  // Protected routes (auth required)
  router.use(requireAuth);
  
  // Admin-only routes
  router.use(requireRole('ADMIN'));
  router.post('/mint', controller.mintTokens.bind(controller));
  router.post('/transfer', controller.transferTokens.bind(controller));

  return router;
}