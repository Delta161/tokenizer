import { PrismaClient, PropertyStatus, Token } from '@prisma/client';
import { TokenCreateDTO, TokenUpdateDTO, TokenPublicDTO, TokenListQuery } from '../types/token.types';
import { mapTokenToPublicDTO, mapTokensToPublicDTOs } from '../utils/token.mapper';
import { isAddress } from 'ethers';
import { BlockchainService, getBlockchainConfig } from '../../../modules/blockchain';
import { TokenMetadata } from '../../../modules/blockchain/types/blockchain.types';
import { tokenLogger } from '../utils/token.logger';
import createError from 'http-errors';

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
    // Ensure property exists and is APPROVED
    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property || property.status !== PropertyStatus.APPROVED) {
      throw createError(400, 'Property must exist and be APPROVED', {
        code: 'INVALID_PROPERTY_STATUS'
      });
    }
    
    // Prevent duplicate token for same property
    const existing = await this.prisma.token.findUnique({ where: { propertyId: dto.propertyId } });
    if (existing) {
      throw createError(409, 'Token already exists for this property', {
        code: 'TOKEN_ALREADY_EXISTS'
      });
    }
    
    // Validate contract address
    if (!isAddress(dto.contractAddress)) {
      throw createError(400, 'Invalid Ethereum contract address', {
        code: 'INVALID_CONTRACT_ADDRESS'
      });
    }
    
    // Validate the contract on the blockchain
    const blockchainService = this.getBlockchainService();
    const validationResult = await blockchainService.validateContract(dto.contractAddress);
    
    if (!validationResult.isValid || !validationResult.isERC20) {
      throw createError(400, 'Contract address does not point to a valid ERC20 token', {
        code: 'INVALID_CONTRACT'
      });
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
    tokenLogger.info('Token created', { tokenId: token.id, propertyId: dto.propertyId });
    
    return mapTokenToPublicDTO(token);
  }

  /**
   * Get all tokens with optional filtering
   * @param query Optional query parameters
   * @returns List of tokens
   */
  async getAll(query: TokenListQuery = {}): Promise<TokenPublicDTO[]> {
    const where: Record<string, unknown> = {};
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.symbol) where.symbol = query.symbol;
    if (query.blockchain) where.blockchain = query.blockchain;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    
    const tokens = await this.prisma.token.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' } 
    });
    
    return mapTokensToPublicDTOs(tokens);
  }

  /**
   * Get a token by ID
   * @param id Token ID
   * @returns Token or null if not found
   */
  async getById(id: string): Promise<TokenPublicDTO | null> {
    const token = await this.prisma.token.findUnique({ where: { id } });
    return token ? mapTokenToPublicDTO(token) : null;
  }
  
  /**
   * Get a token by contract address
   * @param contractAddress Blockchain contract address
   * @returns Token or null if not found
   */
  async getTokenByContractAddress(contractAddress: string): Promise<Token | null> {
    return this.prisma.token.findFirst({ where: { contractAddress } });
  }
  
  /**
   * Get token balance from blockchain
   * @param contractAddress Token contract address
   * @param walletAddress Wallet address to check balance for
   * @returns Balance as string
   */
  async getTokenBalanceFromBlockchain(contractAddress: string, walletAddress: string): Promise<string> {
    const blockchainService = this.getBlockchainService();
    const balance = await blockchainService.getBalanceOf(contractAddress, walletAddress);
    return balance.toString();
  }
  
  /**
   * Get token metadata from blockchain
   * @param contractAddress Token contract address
   * @returns Token metadata
   */
  async getTokenMetadataFromBlockchain(contractAddress: string): Promise<TokenMetadata> {
    const blockchainService = this.getBlockchainService();
    return blockchainService.getTokenMetadata(contractAddress);
  }

  /**
   * Update a token
   * @param id Token ID
   * @param dto Update data
   * @returns Updated token or null if not found
   */
  async update(id: string, dto: TokenUpdateDTO): Promise<TokenPublicDTO | null> {
    const token = await this.prisma.token.findUnique({ where: { id } });
    if (!token) return null;
    
    if (dto.contractAddress && !isAddress(dto.contractAddress)) {
      throw createError(400, 'Invalid Ethereum contract address', {
        code: 'INVALID_CONTRACT_ADDRESS'
      });
    }
    
    const updated = await this.prisma.token.update({ where: { id }, data: dto });
    
    // Log token update
    tokenLogger.info('Token updated', { tokenId: id, updates: Object.keys(dto) });
    
    return mapTokenToPublicDTO(updated);
  }

  /**
   * Delete a token
   * @param id Token ID
   * @returns true if deleted, false if not found or has investments
   */
  async delete(id: string): Promise<boolean> {
    // Only allow delete if no investments exist
    const token = await this.prisma.token.findUnique({ 
      where: { id }, 
      include: { property: true } 
    });
    
    if (!token) return false;
    
    const investments = await this.prisma.investment.findFirst({ where: { tokenId: id } });
    if (investments) return false;
    
    await this.prisma.token.delete({ where: { id } });
    
    // Log token deletion
    tokenLogger.info('Token deleted', { tokenId: id, propertyId: token.propertyId });
    
    return true;
  }

  /**
   * Get all public tokens (linked to approved properties)
   * @returns List of public tokens
   */
  async getAllPublic(): Promise<TokenPublicDTO[]> {
    // Only tokens linked to APPROVED properties
    const tokens = await this.prisma.token.findMany({
      where: {
        property: { status: PropertyStatus.APPROVED },
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return mapTokensToPublicDTOs(tokens);
  }
}