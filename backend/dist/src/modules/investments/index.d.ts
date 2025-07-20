import { InvestorController } from './controllers/investor.controller.js';
import { InvestmentController } from './controllers/investment.controller.js';
import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
export declare function initInvestmentsModule(prisma: PrismaClient): {
    investorController: InvestorController;
    investmentController: InvestmentController;
    routes: {
        investor: Router;
        investment: Router;
    };
};
/**
 * Creates and configures all investment module routes
 * @param prisma PrismaClient instance for database access
 * @returns Configured Express router with all investment module routes
 */
export declare function createInvestmentsRoutes(prisma: PrismaClient): Router;
export * from './types/investor.types.js';
export * from './types/investment.types.js';
//# sourceMappingURL=index.d.ts.map