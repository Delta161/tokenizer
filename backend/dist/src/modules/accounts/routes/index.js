/**
 * Accounts Module Routes
 * Registers and exports all routes for the accounts module
 */
import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { createKycRoutes } from './kyc.routes';
import { KycController } from '../controllers/kyc.controller';
import { kycService } from '../services/kyc.service';
/**
 * Register all accounts routes
 * @returns Express router with all accounts routes mounted
 */
export function registerAccountsRoutes() {
    const router = Router();
    // Create KYC controller and routes
    const kycController = new KycController(kycService);
    const kycRouter = createKycRoutes(kycController);
    // Mount routes
    router.use('/auth', authRouter);
    router.use('/users', userRouter);
    router.use('/kyc', kycRouter);
    return router;
}
// Export individual routers
export { authRouter } from './auth.routes';
export { userRouter } from './user.routes';
export { createKycRoutes } from './kyc.routes';
//# sourceMappingURL=index.js.map