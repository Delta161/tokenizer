import { Investment } from '@prisma/client';
import { InvestmentPublicDTO } from './investment.types.js';
export declare function mapInvestmentToPublicDTO(investment: Investment): InvestmentPublicDTO;
export declare function mapInvestmentsToPublicDTOs(investments: Investment[]): InvestmentPublicDTO[];
//# sourceMappingURL=investment.mapper.d.ts.map