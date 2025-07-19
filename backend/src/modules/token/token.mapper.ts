import { Token } from '@prisma/client';
import { TokenPublicDTO } from './token.types';

/**
 * Maps a Token entity to its public DTO representation
 * @param token The token entity from the database
 * @returns TokenPublicDTO
 */
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

/**
 * Maps an array of Token entities to their public DTO representations
 * @param tokens Array of token entities from the database
 * @returns Array of TokenPublicDTO
 */
export function mapTokensToPublicDTOs(tokens: Token[]): TokenPublicDTO[] {
  return tokens.map(mapTokenToPublicDTO);
}