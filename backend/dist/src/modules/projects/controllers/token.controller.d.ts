import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../accounts/types/auth.types';
import { SmartContractService } from '../../../services/smartContract.service';
export declare class TokenController {
    private prisma;
    private tokenService;
    constructor(prisma: PrismaClient, smartContractService?: SmartContractService);
    /**
     * Create a new token
     */
    create: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Update a token
     */
    update: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get a token by ID
     */
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * List tokens with optional filtering
     */
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get token balance for a wallet address
     */
    getBalance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Get token metadata from blockchain
     */
    getMetadata: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=token.controller.d.ts.map