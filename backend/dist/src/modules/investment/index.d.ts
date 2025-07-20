/**
 * Investment Module Index
 * Exports all components of the investment module
 */
import { PrismaClient } from '@prisma/client';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';
/**
 * Initialize investment module
 * @param prisma PrismaClient instance
 * @returns Object containing routes and services
 */
export declare function initInvestmentModule(prisma: PrismaClient): {
    routes: import("express").Router;
    controller: InvestmentController;
    service: InvestmentService;
};
export * from './investment.types';
export * from './investment.validators';
export { InvestmentService } from './investment.service';
export { InvestmentController } from './investment.controller';
export { createInvestmentRoutes } from './investment.routes';
export { mapInvestmentToPublicDTO, mapInvestmentsToPublicDTOs } from './investment.mapper';
//# sourceMappingURL=index.d.ts.map