import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/auth.types';
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
     * PATCH /clients/me
     * Update current user's client profile
     */
    updateCurrentClientProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /clients/:id
     * Get client profile by ID (Admin only)
     */
    getClientProfileById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /clients
     * Get all clients (Admin only)
     */
    getAllClients: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * PATCH /clients/:id/status
     * Update client status (Admin only)
     */
    updateClientStatus: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=client.controller.d.ts.map