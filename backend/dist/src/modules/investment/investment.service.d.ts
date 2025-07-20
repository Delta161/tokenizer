import { PrismaClient } from '@prisma/client';
import { InvestmentCreateDTO, InvestmentUpdateStatusDTO, InvestmentPublicDTO, InvestmentListQuery } from './investment.types';
export declare class InvestmentService {
    private prisma;
    constructor(prisma: PrismaClient);
    create(investorId: string, dto: InvestmentCreateDTO): Promise<InvestmentPublicDTO>;
    getMyInvestments(investorId: string): Promise<InvestmentPublicDTO[]>;
    getAll(query?: InvestmentListQuery): Promise<InvestmentPublicDTO[]>;
    getById(id: string): Promise<InvestmentPublicDTO>;
    updateStatus(id: string, dto: InvestmentUpdateStatusDTO): Promise<InvestmentPublicDTO>;
}
//# sourceMappingURL=investment.service.d.ts.map