import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ClientController } from './client.controller';
import { authGuard, roleGuard } from '../accounts';

/**
 * Create client routes with proper middleware
 * @param prisma - Prisma client instance
 * @returns Express router with client routes
 */
export function createClientRoutes(prisma: PrismaClient = new PrismaClient()): Router {
  const router = Router();
  const clientController = new ClientController(prisma);

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
   * Get client profile by ID
   * Admin only access
   */
  router.get(
    '/:id',
    authGuard,
    roleGuard(['ADMIN']),
    clientController.getClientProfileById
  );

  /**
   * GET /clients
   * Get all clients with optional filtering
   * Admin only access
   */
  router.get(
    '/',
    authGuard,
    roleGuard(['ADMIN']),
    clientController.getAllClients
  );

  /**
   * PATCH /clients/:id/status
   * Update client status (approve/reject)
   * Admin only access
   */
  router.patch(
    '/:id/status',
    authGuard,
    roleGuard(['ADMIN']),
    clientController.updateClientStatus
  );

  return router;
}

/**
 * Default export for convenience
 */
export default createClientRoutes;
