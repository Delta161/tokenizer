import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../accounts/types/auth.types';
/**
 * Controller for client-related operations
 */
export declare class ClientController {
    private clientService;
    constructor(prisma: PrismaClient);
    /**
     * POST /clients/apply
     * Apply to become a client
     */
    applyAsClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /clients/me
     * Get current user's client profile
     */
    getCurrentClientProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /clients/:id
     * Get client by ID (admin only)
     */
    getClientById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /clients
     * List all clients (admin only)
     */
    listClients: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * PUT /clients/me
     * Update current user's client profile
     */
    updateClientProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * PATCH /clients/:id/status
     * Update client status (admin only)
     */
    updateClientStatus: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=client.controller.d.ts.map