import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/requireAuth.js';
import { SmartContractService } from '../smart-contract/smartContract.service.js';
export declare class TokenController {
    private prisma;
    private smartContractService;
    constructor(prisma: PrismaClient, smartContractService?: SmartContractService);
    private getService;
    create: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getAll: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getAllPublic: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getTokenBalance: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getBlockchainMetadata: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=token.controller.d.ts.map