import { Token } from '@prisma/client';
import { TokenPublicDTO } from './token.types.js';

export function mapTokenToPublicDTO(token: Token): TokenPublicDTO {
  return {
    id: token.id,
    propertyId: token.propertyId,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    totalSupply: token.totalSupply,
    contractAddress: token.contractAddress || '',
    blockchain: token.blockchain,
    isActive: token.isActive,
    isTransferable: token.isTransferable,
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
  };
}

export function mapTokensToPublicDTOs(tokens: Token[]): TokenPublicDTO[] {
  return tokens.map(mapTokenToPublicDTO);
}