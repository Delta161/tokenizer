/**
 * Accounts Module Index
 * Exports all components of the accounts module
 * Consolidates user, auth, and kyc functionality
 */
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
export * from './routes';
export { userRouter } from './routes/user.routes';
export { authRouter } from './routes/auth.routes';
export { createKycRoutes } from './routes/kyc.routes';
export { userController, UserController } from './controllers/user.controller';
export { authController, AuthController } from './controllers/auth.controller';
export { KycController } from './controllers/kyc.controller';
export { userService, UserService } from './services/user.service';
export { authService, AuthService } from './services/auth.service';
export { kycService, KycService } from './services/kyc.service';
export * from './services/token.service';
export { authGuard, roleGuard } from './middleware/auth.middleware';
export { requireKycVerified } from './middleware/kyc.middleware';
export * from './validators';
export * from './utils';
export * from './strategies';
export * from './types';
/**
 * Initialize the KYC module
 * @param prisma PrismaClient instance (optional, will create new instance if not provided)
 * @returns Object containing routes and services
 */
export declare function initKycModule(prisma?: PrismaClient): {
    routes: ReturnType<typeof createKycRoutes>;
    service: KycService;
    controller: KycController;
};
/**
 * Initialize the Accounts module
 * This function consolidates the initialization of user, auth, and kyc modules
 * @param prisma PrismaClient instance (optional, will create new instance if not provided)
 * @returns Object containing all routes and services
 */
export declare function initAccountsModule(prisma?: PrismaClient): {
    router: Router;
    userRouter: typeof userRouter;
    authRouter: typeof authRouter;
    kycRouter: ReturnType<typeof createKycRoutes>;
};
//# sourceMappingURL=index.d.ts.map