import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/requireAuth.js';
export declare class InvestmentController {
    private prisma;
    constructor(prisma: PrismaClient);
    private getService;
    create: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getMyInvestments: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getAll: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    updateStatus: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=investment.controller.d.ts.map