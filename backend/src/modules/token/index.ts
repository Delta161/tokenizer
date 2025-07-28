import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { BlockchainService, getBlockchainConfig } from '../blockchain';

// Export controllers
export * from './controllers';

// Export services
export * from './services';

// Export routes
export * from './routes';

// Export types
export * from './types';

// Export validators
export * from './validators';

// Export utils
export * from './utils';

/**
 * Initialize the token module
 * @param prisma PrismaClient instance
 * @returns Object containing token service and controller
 */
export function initTokenModule(prisma: PrismaClient) {
  // Initialize blockchain service
  const blockchainService = new BlockchainService(getBlockchainConfig());
  
  // Import here to avoid circular dependencies
  const { TokenService } = require('./services/token.service');
  const { TokenController } = require('./controllers/token.controller');
  
  // Initialize services
  const tokenService = new TokenService(prisma, blockchainService);
  
  // Initialize controllers
  const tokenController = new TokenController(prisma, blockchainService);
  
  return {
    tokenService,
    tokenController
  };
}

/**
 * Mount token routes to the provided router
 * @param router Express router
 * @returns The router with token routes mounted
 */
export function mountTokenRoutes(router: Router): Router {
  // Import here to avoid circular dependencies
  const { createTokenRoutes } = require('./routes/token.routes');
  
  // Mount routes
  router.use('/tokens', createTokenRoutes());
  
  return router;
}

/**
 * Get token router
 * @returns Express router with token routes
 */
export function getTokenRouter(): Router {
  // Import here to avoid circular dependencies
  const { createTokenRoutes } = require('./routes/token.routes');
  
  return createTokenRoutes();
}