import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ClientController } from '../controllers/client.controller';
import { authGuard, roleGuard } from '../../accounts';

/**
 * Create client routes with proper middleware
 * @returns Express router with client routes
 */
export function createClientRoutes(): Router {
  const router = Router();
  const clientController = new ClientController();

  /**
   * POST /clients/apply
   * Apply to become a client
   * Requires authentication
   * User must have INVESTOR role to apply
   */
  router.post(
    '/apply',
    authGuard,
    clientController.applyAsClient
  );

  /**
   * GET /clients/me
   * Get current user's client profile
   * Requires authentication and CLIENT role
   */
  router.get(
    '/me',
    authGuard,
    roleGuard(['CLIENT']),
    clientController.getCurrentClientProfile
  );

  /**
   * PATCH /clients/me
   * Update current user's client profile
   * Requires authentication and CLIENT role
   */
  router.patch(
    '/me',
    authGuard,
    roleGuard(['CLIENT']),
    clientController.updateCurrentClientProfile
  );

  /**
   * GET /clients/:id
   * Get client by ID
   * Admin only
   */
  router.get(
    '/:id',
    authGuard,
    roleGuard(['ADMIN']),
    clientController.getClientById
  );

  /**
   * GET /clients
   * List all clients
   * Admin only
   */
  router.get(
    '/',
    authGuard,
    roleGuard(['ADMIN']),
    clientController.listClients
  );

  /**
   * PATCH /clients/:id/status
   * Update client status
   * Admin only
   */
  router.patch(
    '/:id/status',
    authGuard,
    roleGuard(['ADMIN']),
    clientController.updateClientStatus
  );

  return router;
}

// Export a default router instance for convenience
export default createClientRoutes();