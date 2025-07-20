import { Response, Request } from 'express';
import { InvestmentService } from '../services/investment.service.js';
import { AuthenticatedRequest } from '../../accounts/types/auth.types.js';
export declare class InvestmentController {
    private investmentService;
    constructor(investmentService: InvestmentService);
    create: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getMyInvestments: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    updateStatus: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=investment.controller.d.ts.map