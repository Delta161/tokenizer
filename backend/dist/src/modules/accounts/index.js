/**
 * Accounts Module Index
 * Exports all components of the accounts module
 * Consolidates user, auth, and kyc functionality
 */
import { Router } from 'express';
// Import and re-export routes
export * from './routes';
export { userRouter } from './routes/user.routes';
export { authRouter } from './routes/auth.routes';
export { createKycRoutes } from './routes/kyc.routes';
// Import and re-export controllers
export { userController, UserController } from './controllers/user.controller';
export { authController, AuthController } from './controllers/auth.controller';
export { KycController } from './controllers/kyc.controller';
// Import and re-export services
export { userService, UserService } from './services/user.service';
export { authService, AuthService } from './services/auth.service';
export { kycService, KycService } from './services/kyc.service';
export * from './services/token.service';
// Import and re-export middleware
export { authGuard, roleGuard } from './middleware/auth.middleware';
export { requireKycVerified } from './middleware/kyc.middleware';
// Import and re-export validators
export * from './validators';
// Import and re-export utils
export * from './utils';
// Import and re-export strategies
export * from './strategies';
// Import and re-export types
export * from './types';
/**
 * Initialize the KYC module
 * @param prisma PrismaClient instance (optional, will create new instance if not provided)
 * @returns Object containing routes and services
 */
export function initKycModule(prisma) {
    // Create controller instance using the singleton kycService
    const kycController = new KycController(kycService);
    // Create routes
    const routes = createKycRoutes(kycController);
    return {
        routes,
        service: kycService,
        controller: kycController
    };
}
/**
 * Initialize the Accounts module
 * This function consolidates the initialization of user, auth, and kyc modules
 * @param prisma PrismaClient instance (optional, will create new instance if not provided)
 * @returns Object containing all routes and services
 */
export function initAccountsModule(prisma) {
    // Initialize KYC module
    const kycModule = initKycModule(prisma);
    // Create combined router
    const router = Router();
    router.use('/auth', authRouter);
    router.use('/users', userRouter);
    router.use('/kyc', kycModule.routes);
    return {
        router,
        userRouter,
        authRouter,
        kycRouter: kycModule.routes
    };
}
//# sourceMappingURL=index.js.map