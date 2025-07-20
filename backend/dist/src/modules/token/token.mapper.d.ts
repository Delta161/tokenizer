import { Token } from '@prisma/client';
import { TokenPublicDTO } from './token.types';
/**
 * Maps a Token entity to its public DTO representation
 * @param token The token entity from the database
 * @returns TokenPublicDTO
 */
export declare function mapTokenToPublicDTO(token: Token): TokenPublicDTO;
/**
 * Maps an array of Token entities to their public DTO representations
 * @param tokens Array of token entities from the database
 * @returns Array of TokenPublicDTO
 */
export declare function mapTokensToPublicDTOs(tokens: Token[]): TokenPublicDTO[];
//# sourceMappingURL=token.mapper.d.ts.map