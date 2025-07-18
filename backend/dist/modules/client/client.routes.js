import { Router } from 'express';
import { requireAuth } from '../auth/requireAuth.js';
import { requireAdmin, requireClient } from '../auth/requireRole.js';
import { ClientController } from './client.controller.js';
/**
 * Create client routes with proper middleware
 * @param prisma - Prisma client instance
 * @returns Express router with client routes
 */
export function createClientRoutes(prisma) {
    const router = Router();
    const clientController = new ClientController(prisma);
    /**
     * POST /clients/apply
     * Apply to become a client
     * Requires authentication
     * User must have INVESTOR role to apply
     */
    router.post('/apply', requireAuth, clientController.applyAsClient);
    /**
     * GET /clients/me
     * Get current user's client profile
     * Requires authentication and CLIENT role
     */
    router.get('/me', requireAuth, requireClient, clientController.getCurrentClientProfile);
    /**
     * PATCH /clients/me
     * Update current user's client profile
     * Requires authentication and CLIENT role
     */
    router.patch('/me', requireAuth, requireClient, clientController.updateCurrentClientProfile);
    /**
     * GET /clients/:id
     * Get client profile by ID
     * Admin only access
     */
    router.get('/:id', requireAuth, requireAdmin, clientController.getClientProfileById);
    /**
     * GET /clients
     * Get all clients with optional filtering
     * Admin only access
     */
    router.get('/', requireAuth, requireAdmin, clientController.getAllClients);
    /**
     * PATCH /clients/:id/status
     * Update client status (approve/reject)
     * Admin only access
     */
    router.patch('/:id/status', requireAuth, requireAdmin, clientController.updateClientStatus);
    return router;
}
/**
 * Default export for convenience
 */
export default createClientRoutes;
//# sourceMappingURL=client.routes.js.map