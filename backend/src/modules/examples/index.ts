import { Router } from 'express';
import featureFlagExampleRouter from './feature-flag-example';

/**
 * Initializes the examples module
 * @returns The configured router
 */
export const initExamplesModule = (): Router => {
  const router = Router();

  // Mount the feature flag example routes
  router.use('/feature-flags', featureFlagExampleRouter);

  return router;
};