/**
 * Token Service
 * Handles business logic for token-related operations
 */

import { PrismaClient, PropertyStatus, Token } from '@prisma/client';
import { TokenCreateDTO, TokenUpdateDTO, TokenPublicDTO, TokenListQuery } from '../types/projects.types';
import { mapTokenToDTO } from '../utils/mappers';
import { isAddress } from 'ethers';
import { BlockchainService, getBlockchainConfig } from '../../../modules/blockchain';
import { TokenMetadata } from '../../../modules/blockchain/types/blockchain.types';
import { logger } from '../../../utils/logger';

/**
 * Token Not Found Error
 * Thrown when a token cannot be found
 */
export class TokenNotFoundError extends Error {
  constructor(tokenId: string) {
    super(`Token with ID ${tokenId} not found`);
    this.name = 'TokenNotFoundError';
  }
}

/**
 * Token Access Error
 * Thrown when a user attempts to access a token they don't have permission for
 */
export class TokenAccessError extends Error {
  constructor(message = 'You do not have permission to access this token') {
    super(message);
    this.name = 'TokenAccessError';
  }
}

/**
 * Token Validation Error
 * Thrown when token data fails validation
 */
export class TokenValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenValidationError';
  }
}

/**
 * Token Service
 * Provides methods for managing tokens
 */
export class TokenService {
  private blockchainService: BlockchainService;
  
  constructor(
    private prisma: PrismaClient,
    blockchainService?: BlockchainService
  ) {
    // If blockchainService is not provided, we'll initialize it later when needed
    this.blockchainService = blockchainService;
  }

  // Get or initialize the blockchain service
  private getBlockchainService(): BlockchainService {
    if (!this.blockchainService) {
      this.blockchainService = new BlockchainService(getBlockchainConfig());
    }
    return this.blockchainService;
  }

  /**
   * Create a new token
   * @param dto Token creation data
   * @returns The created token
   */
  async create(dto: TokenCreateDTO): Promise<TokenPublicDTO> {
    try {
      // Ensure property exists and is APPROVED
      const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
      if (!property || property.status !== PropertyStatus.APPROVED) {
        throw new TokenValidationError('Property must exist and be APPROVED');
      }
      
      // Prevent duplicate token for same property
      const existing = await this.prisma.token.findUnique({ where: { propertyId: dto.propertyId } });
      if (existing) {
        throw new TokenValidationError('Token already exists for this property');
      }
      
      // Validate contract address
      if (!isAddress(dto.contractAddress)) {
        throw new TokenValidationError('Invalid Ethereum contract address');
      }
      
      // Validate the contract on the blockchain
      const blockchainService = this.getBlockchainService();
      const validationResult = await blockchainService.validateContract(dto.contractAddress);
      
      if (!validationResult.isValid || !validationResult.isERC20) {
        throw new TokenValidationError('Contract address does not point to a valid ERC20 token');
      }
      
      // Create token
      const token = await this.prisma.token.create({
        data: {
          propertyId: dto.propertyId,
          name: dto.name,
          symbol: dto.symbol,
          decimals: dto.decimals,
          totalSupply: parseInt(dto.totalSupply, 10),
          contractAddress: dto.contractAddress,
          blockchain: dto.blockchain || 'SEPOLIA', // Default to SEPOLIA blockchain
        },
      });

      // Log token creation
      logger.info('Token created', { tokenId: token.id, propertyId: dto.propertyId });
      
      return mapTokenToDTO(token);
    } catch (error) {
      logger.error('Error creating token:', error);
      throw error;
    }
  }

  /**
   * Get all tokens with optional filtering
   * @param query Optional query parameters
   * @returns List of tokens
   */
  async getAll(query: TokenListQuery = {}): Promise<TokenPublicDTO[]> {
    try {
      const where: Record<string, unknown> = {};
      if (query.propertyId) where.propertyId = query.propertyId;
      if (query.symbol) where.symbol = query.symbol;
      if (query.blockchain) where.blockchain = query.blockchain;
      if (query.isActive !== undefined) where.isActive = query.isActive;
      
      const tokens = await this.prisma.token.findMany({ 
        where, 
        orderBy: { createdAt: 'desc' } 
      });
      
      return tokens.map(token => mapTokenToDTO(token));
    } catch (error) {
      logger.error('Error getting tokens:', error);
      throw error;
    }
  }
  
  /**
   * List tokens with pagination and filtering
   * @param query Query parameters for filtering and pagination
   * @returns List of tokens
   */
  async list(query: TokenListQuery = {}): Promise<TokenPublicDTO[]> {
    try {
      const where: Record<string, unknown> = {};
      if (query.propertyId) where.propertyId = query.propertyId;
      if (query.symbol) where.symbol = query.symbol;
      if (query.blockchain) where.blockchain = query.blockchain;
      if (query.isActive !== undefined) where.isActive = query.isActive;
      
      // Calculate pagination values
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      
      const tokens = await this.prisma.token.findMany({ 
        where, 
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      });
      
      return tokens.map(token => mapTokenToDTO(token));
    } catch (error) {
      logger.error('Error listing tokens:', error);
      throw error;
    }
  }

  /**
   * Get a token by ID
   * @param id Token ID
   * @returns Token or null if not found
   */
  async getById(id: string): Promise<TokenPublicDTO | null> {
    try {
      const token = await this.prisma.token.findUnique({ where: { id } });
      return token ? mapTokenToDTO(token) : null;
    } catch (error) {
      logger.error(`Error getting token ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a token by contract address
   * @param contractAddress Blockchain contract address
   * @returns Token or null if not found
   */
  async getTokenByContractAddress(contractAddress: string): Promise<Token | null> {
    try {
      return this.prisma.token.findFirst({ where: { contractAddress } });
    } catch (error) {
      logger.error(`Error getting token by contract address ${contractAddress}:`, error);
      throw error;
    }
  }
  
  /**
   * Get token balance from blockchain
   * @param contractAddress Token contract address
   * @param walletAddress Wallet address to check balance for
   * @returns Balance as string
   */
  async getTokenBalanceFromBlockchain(contractAddress: string, walletAddress: string): Promise<string> {
    try {
      const blockchainService = this.getBlockchainService();
      const balance = await blockchainService.getBalanceOf(contractAddress, walletAddress);
      return balance.toString();
    } catch (error) {
      logger.error(`Error getting token balance for ${walletAddress} at ${contractAddress}:`, error);
      throw error;
    }
  }
  
  /**
   * Get token balance from blockchain (alias for getTokenBalanceFromBlockchain)
   * @param contractAddress Token contract address
   * @param walletAddress Wallet address to check balance for
   * @returns Balance as string
   */
  async getTokenBalance(contractAddress: string, walletAddress: string): Promise<string> {
    return this.getTokenBalanceFromBlockchain(contractAddress, walletAddress);
  }
  
  /**
   * Get token metadata from blockchain
   * @param contractAddress Token contract address
   * @returns Token metadata
   */
  async getTokenMetadataFromBlockchain(contractAddress: string): Promise<TokenMetadata> {
    try {
      const blockchainService = this.getBlockchainService();
      return blockchainService.getTokenMetadata(contractAddress);
    } catch (error) {
      logger.error(`Error getting token metadata for ${contractAddress}:`, error);
      throw error;
    }
  }

  /**
   * Update a token
   * @param id Token ID
   * @param dto Update data
   * @returns Updated token or null if not found
   */
  async update(id: string, dto: TokenUpdateDTO): Promise<TokenPublicDTO | null> {
    try {
      const token = await this.prisma.token.findUnique({ where: { id } });
      if (!token) {
        throw new TokenNotFoundError(id);
      }
      
      if (dto.contractAddress && !isAddress(dto.contractAddress)) {
        throw new TokenValidationError('Invalid Ethereum contract address');
      }
      
      const updated = await this.prisma.token.update({ where: { id }, data: dto });
      
      // Log token update
      logger.info('Token updated', { tokenId: id, updates: Object.keys(dto) });
      
      return mapTokenToDTO(updated);
    } catch (error) {
      if (error instanceof TokenNotFoundError || error instanceof TokenValidationError) {
        throw error;
      }
      logger.error(`Error updating token ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a token
   * @param id Token ID
   * @returns true if deleted, false if not found or has investments
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Only allow delete if no investments exist
      const token = await this.prisma.token.findUnique({ 
        where: { id }, 
        include: { property: true } 
      });
      
      if (!token) {
        throw new TokenNotFoundError(id);
      }
      
      const investments = await this.prisma.investment.findFirst({ where: { tokenId: id } });
      if (investments) {
        throw new TokenValidationError('Cannot delete token with existing investments');
      }
      
      await this.prisma.token.delete({ where: { id } });
      
      // Log token deletion
      logger.info('Token deleted', { tokenId: id, propertyId: token.propertyId });
      
      return true;
    } catch (error) {
      if (error instanceof TokenNotFoundError || error instanceof TokenValidationError) {
        throw error;
      }
      logger.error(`Error deleting token ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all public tokens (linked to approved properties)
   * @returns List of public tokens
   */
  async getAllPublic(): Promise<TokenPublicDTO[]> {
    try {
      // Only tokens linked to APPROVED properties
      const tokens = await this.prisma.token.findMany({
        where: {
          property: { status: PropertyStatus.APPROVED },
          isActive: true
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return tokens.map(token => mapTokenToDTO(token));
    } catch (error) {
      logger.error('Error getting public tokens:', error);
      throw error;
    }
  }
}