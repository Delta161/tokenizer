/**
 * Investment Module Index
 * Exports all components of the investment module
 */

import { PrismaClient } from '@prisma/client';
import { createInvestmentRoutes } from './investment.routes';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';

/**
 * Initialize investment module
 * @param prisma PrismaClient instance
 * @returns Object containing routes and services
 */
export function initInvestmentModule(prisma: PrismaClient) {
  const investmentRoutes = createInvestmentRoutes(prisma);
  const investmentController = new InvestmentController(prisma);
  const investmentService = new InvestmentService(prisma);

  return {
    routes: investmentRoutes,
    controller: investmentController,
    service: investmentService
  };
}

// Export types
export * from './investment.types';

// Export validators
export * from './investment.validators';

// Export service and controller
export { InvestmentService } from './investment.service';
export { InvestmentController } from './investment.controller';

// Export routes
export { createInvestmentRoutes } from './investment.routes';

// Export mappers
export { mapInvestmentToPublicDTO, mapInvestmentsToPublicDTOs } from './investment.mapper';