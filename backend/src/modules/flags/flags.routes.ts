import { Router } from 'express';
import { flagsController } from './flags.controller';
import { authGuard, roleGuard } from '../auth/auth.middleware';
import { validateBody, validateParams } from './flags.validation';
import { UpdateFlagSchema, FlagKeyParamSchema } from './flags.validators';

/**
 * Create and configure the flags router
 */
export const createFlagsRouter = (): Router => {
  const router = Router();

  // Admin CRUD for flags
  router.get(
    '/admin/flags',
    authGuard,
    roleGuard(['ADMIN']),
    flagsController.getAll
  );
  
  router.patch(
    '/admin/flags/:key',
    authGuard,
    roleGuard(['ADMIN']),
    validateParams(FlagKeyParamSchema),
    validateBody(UpdateFlagSchema),
    flagsController.update
  );

  // Client-facing read endpoint
  router.get(
    '/flags',
    authGuard,
    flagsController.getAll
  );

  return router;
};

// Export a singleton instance
export const flagsRouter = createFlagsRouter();

/**
 * Mount flags routes to an existing Express app
 * @param app Express application
 * @param basePath Base path for mounting the router
 */
export const mountFlagsRoutes = (app: any, basePath: string = '/api'): void => {
  app.use(basePath, flagsRouter);
};