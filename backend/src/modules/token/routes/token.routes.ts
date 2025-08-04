import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TokenController } from '../controllers/token.controller';
import { authGuard } from '@/modules/accounts/middleware/auth.middleware';
import { roleGuard } from '@/modules/accounts/middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import { requireKycVerified } from '@/middleware/kyc.middleware';
import { BlockchainService, getBlockchainConfig } from '../../blockchain/services/blockchain.service.js';

/**
 * Creates and configures the token routes
 * @returns Express Router with token routes
 */
export function createTokenRoutes(): Router {
  const router = Router();
  const prisma = new PrismaClient();
  const blockchainService = new BlockchainService(getBlockchainConfig());
  const controller = new TokenController(prisma, blockchainService);

  // Public routes
  // None

  // User routes (requires authentication)
  router.get(
    '/public',
    authGuard,
    roleGuard([UserRole.INVESTOR]),
    controller.getAllPublic
  );

  // Blockchain endpoints - require KYC verification for token balance
  router.get(
    '/blockchain/balance',
    authGuard,
    requireKycVerified,
    controller.getTokenBalance
  );

  router.get(
    '/blockchain/metadata/:contractAddress',
    authGuard,
    controller.getBlockchainMetadata
  );

  // Admin routes
  router.post(
    '/',
    authGuard,
    roleGuard([UserRole.ADMIN]),
    controller.create
  );

  router.get(
    '/',
    authGuard,
    roleGuard([UserRole.ADMIN]),
    controller.getAll
  );

  router.get(
    '/:id',
    authGuard,
    roleGuard([UserRole.ADMIN]),
    controller.getById
  );

  router.patch(
    '/:id',
    authGuard,
    roleGuard([UserRole.ADMIN]),
    controller.update
  );

  router.delete(
    '/:id',
    authGuard,
    roleGuard([UserRole.ADMIN]),
    controller.delete
  );

  return router;
}