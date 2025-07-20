import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}
export declare class InvestmentController {
    private prisma;
    constructor(prisma: PrismaClient);
    private getService;
    create: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getMyInvestments: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getAll: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    updateStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=investment.controller.d.ts.map