import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../accounts/types/auth.types';
import { SmartContractService } from '../../services/smartContract.service';
export declare class TokenController {
    private prisma;
    private tokenService;
    constructor(prisma: PrismaClient, smartContractService?: SmartContractService);
    /**
     * Create a new token
     */
    create: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get all tokens (admin)
     */
    getAll: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get a token by ID
     */
    getById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Update a token
     */
    update: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Delete a token
     */
    delete: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get all public tokens (for investors)
     */
    getAllPublic: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get token balance from blockchain
     */
    getTokenBalance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get token metadata from blockchain
     */
    getBlockchainMetadata: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=token.controller.d.ts.map