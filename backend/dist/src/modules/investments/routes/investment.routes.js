import { Router } from 'express';
import { authGuard, roleGuard } from '../../accounts/middleware/auth.middleware.js';
/**
 * Creates and configures the investment routes
 * @param controller InvestmentController instance for handling requests
 * @returns Configured Express router
 */
export function createInvestmentRoutes(controller) {
    const router = Router();
    // Investor endpoints
    router.post('/', authGuard, roleGuard('INVESTOR'), controller.create);
    router.get('/me', authGuard, roleGuard('INVESTOR'), controller.getMyInvestments);
    // Admin endpoints
    router.get('/', authGuard, roleGuard('ADMIN'), controller.getAll);
    router.get('/:id', authGuard, roleGuard('ADMIN'), controller.getById);
    router.patch('/:id/status', authGuard, roleGuard('ADMIN'), controller.updateStatus);
    return router;
}
//# sourceMappingURL=investment.routes.js.map