/**
 * Accounts Module Routes
 * Registers and exports all routes for the accounts module
 */
import { Router } from 'express';
/**
 * Register all accounts routes
 * @returns Express router with all accounts routes mounted
 */
export declare function registerAccountsRoutes(): Router;
export { authRouter } from './auth.routes';
export { userRouter } from './user.routes';
export { createKycRoutes } from './kyc.routes';
//# sourceMappingURL=index.d.ts.map