/**
 * Accounts Module Routes
 * Registers and exports all routes for the accounts module
 */

import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { kycRouter } from './kyc.routes';
import performanceRouter from './performance.routes';

/**
 * Register all accounts routes
 * @returns Express router with all accounts routes mounted
 */
export function registerAccountsRoutes(): Router {
  const router = Router();
  
  // Mount routes
  router.use('/auth', authRouter);
  router.use('/users', userRouter);
  router.use('/kyc', kycRouter);
  router.use('/performance', performanceRouter);
  
  return router;
}

// Export individual routers
export { authRouter } from './auth.routes';
export { userRouter } from './user.routes';
export { kycRouter } from './kyc.routes';
export { default as performanceRouter } from './performance.routes';

