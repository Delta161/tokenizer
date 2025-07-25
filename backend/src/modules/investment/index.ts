/**
 * Investment Module Index
 * Exports all components of the investment module
 */

import { PrismaClient } from '@prisma/client';
import { createInvestmentRoutes } from './routes/investment.routes';
import { InvestmentController } from './controllers/investment.controller';
import { InvestmentService } from './services/investment.service';
import { logger } from '@/utils/logger';

/**
 * Initialize investment module
 * @param prisma PrismaClient instance
 * @returns Object containing routes and services
 */
export function initInvestmentModule(prisma: PrismaClient) {
  logger.info('Initializing investment module');
  
  const investmentRoutes = createInvestmentRoutes(prisma);
  const investmentController = new InvestmentController(prisma);
  const investmentService = new InvestmentService(prisma);

  logger.info('Investment module initialized successfully');
  
  return {
    routes: investmentRoutes,
    controller: investmentController,
    service: investmentService
  };
}

// Export types
export * from './types/investment.types';

// Export validators
export * from './validators/investment.validators';

// Export service and controller
export { InvestmentService } from './services/investment.service';
export { InvestmentController } from './controllers/investment.controller';

// Export routes
export { createInvestmentRoutes } from './routes/investment.routes';

// Export mappers
export { mapInvestmentToPublicDTO, mapInvestmentsToPublicDTOs } from './utils/investment.mapper';