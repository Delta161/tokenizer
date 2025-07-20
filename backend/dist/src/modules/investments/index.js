import { InvestorController } from './controllers/investor.controller.js';
import { InvestmentController } from './controllers/investment.controller.js';
import { InvestorService } from './services/investor.service.js';
import { InvestmentService } from './services/investment.service.js';
import { createInvestorRoutes } from './routes/investor.routes.js';
import { createInvestmentRoutes } from './routes/investment.routes.js';
import { Router } from 'express';
export function initInvestmentsModule(prisma) {
    const investorService = new InvestorService(prisma);
    const investmentService = new InvestmentService(prisma);
    const investorController = new InvestorController(investorService);
    const investmentController = new InvestmentController(investmentService);
    const investorRoutes = createInvestorRoutes(investorController);
    const investmentRoutes = createInvestmentRoutes(investmentController);
    return {
        investorController,
        investmentController,
        routes: {
            investor: investorRoutes,
            investment: investmentRoutes
        }
    };
}
/**
 * Creates and configures all investment module routes
 * @param prisma PrismaClient instance for database access
 * @returns Configured Express router with all investment module routes
 */
export function createInvestmentsRoutes(prisma) {
    const router = Router();
    const { routes } = initInvestmentsModule(prisma);
    router.use('/investors', routes.investor);
    router.use('/investments', routes.investment);
    return router;
}
export * from './types/investor.types.js';
export * from './types/investment.types.js';
//# sourceMappingURL=index.js.map