import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { SmartContractService } from './smartContract.service.js';
export declare class SmartContractController {
    private smartContractService;
    private prisma;
    constructor(smartContractService: SmartContractService, prisma: PrismaClient);
    validateContract(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getTokenMetadata(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getBalanceOf(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getGasPrice(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getNetworkConfig(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    mintTokens(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    transferTokens(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getTransactionReceipt(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=smartContract.controller.d.ts.map