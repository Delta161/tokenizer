import { Investment } from '@prisma/client';
import { InvestmentPublicDTO } from '../types/investment.types';
import { logger } from '@/utils/logger';

/**
 * Maps a Prisma Investment model to a public DTO
 * @param investment - Prisma Investment model
 * @returns Investment public DTO
 */
export function mapInvestmentToPublicDTO(investment: Investment): InvestmentPublicDTO {
  logger.debug(`Mapping investment ${investment.id} to public DTO`);
  
  // Calculate the number of tokens bought based on amount and price per token
  let tokenAmount = 0;
  try {
    const amount = parseFloat(investment.amount.toString());
    const price = parseFloat(investment.pricePerToken.toString());
    
    // Prevent division by zero or invalid values
    if (price > 0 && !isNaN(amount) && !isNaN(price) && isFinite(amount) && isFinite(price)) {
      tokenAmount = amount / price;
    }
    
    logger.debug(`Calculated tokens bought: ${tokenAmount} for investment ${investment.id}`);
  } catch (error) {
    const errorObj = error as Error;
    logger.error(`Failed to calculate token amount for investment ${investment.id}: ${errorObj.message}`, { error });
    // Default to 0 if calculation fails
  }
  
  return {
    id: investment.id,
    investorId: investment.investorId,
    tokenId: investment.tokenId,
    propertyId: investment.propertyId || '',
    amount: investment.amount.toString(),
    tokensBought: tokenAmount.toString(),
    status: investment.status as InvestmentPublicDTO['status'],
    txHash: investment.txHash || undefined,
    walletAddress: investment.walletAddress || '',
    createdAt: investment.createdAt,
    updatedAt: investment.updatedAt,
  };
}

/**
 * Maps an array of Prisma Investment models to public DTOs
 * @param investments - Array of Prisma Investment models
 * @returns Array of Investment public DTOs
 */
export function mapInvestmentsToPublicDTOs(investments: Investment[]): InvestmentPublicDTO[] {
  logger.debug(`Mapping ${investments.length} investments to public DTOs`);
  return investments.map(mapInvestmentToPublicDTO);
}