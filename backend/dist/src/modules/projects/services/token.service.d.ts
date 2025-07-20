/**
 * Token Service
 * Handles business logic for token-related operations
 */
import { PrismaClient, Token } from '@prisma/client';
import { TokenCreateDTO, TokenUpdateDTO, TokenPublicDTO, TokenListQuery } from '../types/projects.types';
import { BlockchainService } from '../../../modules/blockchain/index.js';
import { TokenMetadata } from '../../../modules/blockchain/types/blockchain.types.js';
/**
 * Token Not Found Error
 * Thrown when a token cannot be found
 */
export declare class TokenNotFoundError extends Error {
    constructor(tokenId: string);
}
/**
 * Token Access Error
 * Thrown when a user attempts to access a token they don't have permission for
 */
export declare class TokenAccessError extends Error {
    constructor(message?: string);
}
/**
 * Token Validation Error
 * Thrown when token data fails validation
 */
export declare class TokenValidationError extends Error {
    constructor(message: string);
}
/**
 * Token Service
 * Provides methods for managing tokens
 */
export declare class TokenService {
    private prisma;
    private blockchainService;
    constructor(prisma: PrismaClient, blockchainService?: BlockchainService);
    private getBlockchainService;
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
     * List tokens with pagination and filtering
     * @param query Query parameters for filtering and pagination
     * @returns List of tokens
     */
    list(query?: TokenListQuery): Promise<TokenPublicDTO[]>;
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
     * Get token balance from blockchain (alias for getTokenBalanceFromBlockchain)
     * @param contractAddress Token contract address
     * @param walletAddress Wallet address to check balance for
     * @returns Balance as string
     */
    getTokenBalance(contractAddress: string, walletAddress: string): Promise<string>;
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