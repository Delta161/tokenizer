import { PrismaClient, Token } from '@prisma/client';
import { TokenCreateDTO, TokenUpdateDTO, TokenPublicDTO, TokenListQuery } from './token.types';
import { SmartContractService } from '../../services/smartContract.service';
import { TokenMetadata } from '../../types/smartContract.types';
export declare class TokenService {
    private prisma;
    private smartContractService;
    constructor(prisma: PrismaClient, smartContractService?: SmartContractService);
    private getSmartContractService;
    /**
     * Create a new token
     * @param dto Token creation data
     * @returns The created token
     */
    create(dto: TokenCreateDTO): Promise<TokenPublicDTO>;
    /**
     * Get all tokens with optional filtering
     * @param query Optional query parameters
     * @returns List of tokens
     */
    getAll(query?: TokenListQuery): Promise<TokenPublicDTO[]>;
    /**
     * Get a token by ID
     * @param id Token ID
     * @returns Token or null if not found
     */
    getById(id: string): Promise<TokenPublicDTO | null>;
    /**
     * Get a token by contract address
     * @param contractAddress Blockchain contract address
     * @returns Token or null if not found
     */
    getTokenByContractAddress(contractAddress: string): Promise<Token | null>;
    /**
     * Get token balance from blockchain
     * @param contractAddress Token contract address
     * @param walletAddress Wallet address to check balance for
     * @returns Balance as string
     */
    getTokenBalanceFromBlockchain(contractAddress: string, walletAddress: string): Promise<string>;
    /**
     * Get token metadata from blockchain
     * @param contractAddress Token contract address
     * @returns Token metadata
     */
    getTokenMetadataFromBlockchain(contractAddress: string): Promise<TokenMetadata>;
    /**
     * Update a token
     * @param id Token ID
     * @param dto Update data
     * @returns Updated token or null if not found
     */
    update(id: string, dto: TokenUpdateDTO): Promise<TokenPublicDTO | null>;
    /**
     * Delete a token
     * @param id Token ID
     * @returns true if deleted, false if not found or has investments
     */
    delete(id: string): Promise<boolean>;
    /**
     * Get all public tokens (linked to approved properties)
     * @returns List of public tokens
     */
    getAllPublic(): Promise<TokenPublicDTO[]>;
}
//# sourceMappingURL=token.service.d.ts.map