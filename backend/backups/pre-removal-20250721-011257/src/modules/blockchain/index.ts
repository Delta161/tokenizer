import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { BlockchainService, getBlockchainConfig } from './services/blockchain.service.js';
import { BlockchainController } from './controllers/blockchain.controller.js';
import blockchainRoutes from './routes/blockchain.routes.js';
import { validateAddress, validateTxHash } from './utils/blockchain.utils.js';

// Export types
export * from './types/blockchain.types.js';

// Export utilities
export {
  validateAddress,
  validateTxHash,
  getBlockchainConfig
};

/**
 * Initialize the blockchain module
 * @returns Router instance for the blockchain module
 */
export function initBlockchainModule(): Router {
  const prisma = new PrismaClient();
  const config = getBlockchainConfig();
  const blockchainService = new BlockchainService(config);
  const blockchainController = new BlockchainController(blockchainService, prisma);
  
  return blockchainRoutes;
}

export default initBlockchainModule;