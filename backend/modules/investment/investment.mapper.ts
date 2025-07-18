import { Investment } from '@prisma/client';
import { InvestmentPublicDTO } from './investment.types.js';

export function mapInvestmentToPublicDTO(investment: Investment): InvestmentPublicDTO {
  return {
    id: investment.id,
    investorId: investment.investorId,
    tokenId: investment.tokenId,
    propertyId: investment.propertyId || '',
    amount: investment.amount.toString(),
    tokensBought: (investment.amount / parseFloat(investment.pricePerToken.toString())).toString(),
    status: investment.status as InvestmentPublicDTO['status'],
    txHash: investment.txHash || undefined,
    walletAddress: investment.walletAddress || '',
    createdAt: investment.createdAt,
    updatedAt: investment.updatedAt,
  };
}

export function mapInvestmentsToPublicDTOs(investments: Investment[]): InvestmentPublicDTO[] {
  return investments.map(mapInvestmentToPublicDTO);
}