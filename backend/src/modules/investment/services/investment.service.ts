import { PrismaClient, PropertyStatus, Prisma } from '@prisma/client';
import { 
  InvestmentCreateDTO, 
  InvestmentUpdateStatusDTO, 
  InvestmentPublicDTO, 
  InvestmentListQuery,
  PaginationMeta
} from '../types/investment.types';
import { mapInvestmentToPublicDTO, mapInvestmentsToPublicDTOs } from '../utils/investment.mapper';
import { isAddress } from 'ethers';
import { prisma } from '@/prisma/client';
import { logger } from '@/utils/logger';
import { PAGINATION } from '@/config/constants';

/**
 * Service for managing investments
 */
export class InvestmentService {
  constructor(private prismaClient?: PrismaClient) {}
  
  // Use the shared prisma instance for operations that don't need transaction context
  private get prisma() {
    return this.prismaClient || prisma;
  }
  
  /**
   * Calculate pagination metadata
   * @param totalItems - Total number of items
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Pagination metadata
   */
  private calculatePaginationMeta(totalItems: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    };
  }

  /**
   * Create a new investment
   * @param investorId - ID of the investor
   * @param dto - Investment creation data
   * @returns Created investment
   */
  async create(investorId: string, dto: InvestmentCreateDTO): Promise<InvestmentPublicDTO> {
    logger.info(`Creating investment for investor ${investorId} with token ${dto.tokenId}`);
    
    // Convert string values to numbers for consistent calculations
    const amountValue = parseFloat(dto.amount);
    const pricePerTokenValue = parseFloat(dto.tokensBought);
    
    // Calculate tokens requested (amount is the total investment value, tokensBought is price per token)
    const tokensRequested = amountValue / pricePerTokenValue;
    logger.debug(`Investment calculation: amount=${amountValue}, pricePerToken=${pricePerTokenValue}, tokensRequested=${tokensRequested}`);
    
    return await this.prisma.$transaction(async (tx) => {
      // Validate token and property
      const token = await tx.token.findUnique({ where: { id: dto.tokenId }, include: { property: true } });
      if (!token) {
        logger.warn(`Token not found: ${dto.tokenId}`);
        throw new Error('Token not found');
      }
      if (!token.isActive) {
        logger.warn(`Token is not active: ${dto.tokenId}`);
        throw new Error('Token is not active');
      }
      if (!token.property) {
        logger.warn(`Property not found for token: ${dto.tokenId}`);
        throw new Error('Property not found');
      }
      if (token.property.status !== PropertyStatus.APPROVED) {
        logger.warn(`Property not approved for token: ${dto.tokenId}, status: ${token.property.status}`);
        throw new Error('Property must be APPROVED');
      }
      
      // Validate supply (tokensRequested <= totalSupply)
      if (tokensRequested > token.totalSupply) {
        logger.warn(`Not enough token supply. Requested: ${tokensRequested}, Available: ${token.totalSupply}`);
        throw new Error(`Not enough token supply. Requested: ${tokensRequested}, Available: ${token.totalSupply}`);
      }
      
      // Validate Ethereum address
      if (!isAddress(dto.walletAddress)) {
        logger.warn(`Invalid Ethereum address: ${dto.walletAddress}`);
        throw new Error('Invalid Ethereum address');
      }
      
      // Create investment
      try {
        logger.debug('Creating investment record in database');
        const investment = await tx.investment.create({
          data: {
            investorId,
            tokenId: dto.tokenId,
            propertyId: dto.propertyId,
            amount: Math.round(amountValue), // Store as integer
            pricePerToken: pricePerTokenValue.toString(), // Store as Decimal
            totalValue: (amountValue).toString(), // Total value is the amount
            currency: dto.currency || 'USD',
            paymentMethod: dto.paymentMethod || 'CRYPTO',
            status: 'PENDING',
            walletAddress: dto.walletAddress,
          },
        });
        logger.info(`Investment created successfully with ID: ${investment.id}`);
        return mapInvestmentToPublicDTO(investment);
      } catch (error) {
        const errorObj = error as Error;
        logger.error(`Failed to create investment: ${errorObj.message}`, { error });
        throw new Error(`Failed to create investment: ${errorObj.message}`);
      }
    });
  }

  /**
   * Get investments for a specific investor with pagination
   * @param investorId - ID of the investor
   * @param query - Query parameters including pagination
   * @returns List of investments with pagination metadata
   */
  async getMyInvestments(
    investorId: string, 
    query: InvestmentListQuery = {}
  ): Promise<{ data: InvestmentPublicDTO[], meta: PaginationMeta }> {
    logger.info(`Fetching investments for investor: ${investorId}`);
    
    // Parse pagination parameters
    const page = Math.max(1, query.page || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, query.limit || PAGINATION.DEFAULT_LIMIT),
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;
    
    // Set up sorting
    const orderBy: Prisma.InvestmentOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.InvestmentOrderByWithRelationInput] = 
        query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }
    
    // Count total items for pagination
    const totalItems = await this.prisma.investment.count({
      where: { investorId }
    });
    
    // Fetch paginated data
    const investments = await this.prisma.investment.findMany({ 
      where: { investorId },
      orderBy,
      skip,
      take: limit
    });
    
    logger.debug(`Found ${investments.length} investments for investor ${investorId}`);
    
    // Calculate pagination metadata
    const meta = this.calculatePaginationMeta(totalItems, page, limit);
    
    return {
      data: mapInvestmentsToPublicDTOs(investments),
      meta
    };
  }

  /**
   * Get all investments with filtering and pagination
   * @param query - Query parameters including filters and pagination
   * @returns List of investments with pagination metadata
   */
  async getAll(
    query: InvestmentListQuery = {}
  ): Promise<{ data: InvestmentPublicDTO[], meta: PaginationMeta }> {
    logger.info('Fetching all investments with filters:', query);
    
    // Build where clause from query parameters
    const where: Prisma.InvestmentWhereInput = {};
    if (query.investorId) where.investorId = query.investorId;
    if (query.tokenId) where.tokenId = query.tokenId;
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;
    
    // Parse pagination parameters
    const page = Math.max(1, query.page || PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      Math.max(1, query.limit || PAGINATION.DEFAULT_LIMIT),
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;
    
    // Set up sorting
    const orderBy: Prisma.InvestmentOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.InvestmentOrderByWithRelationInput] = 
        query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }
    
    // Count total items for pagination
    const totalItems = await this.prisma.investment.count({ where });
    
    // Fetch paginated data
    const investments = await this.prisma.investment.findMany({ 
      where, 
      orderBy,
      skip,
      take: limit
    });
    
    logger.debug(`Found ${investments.length} investments matching filters`);
    
    // Calculate pagination metadata
    const meta = this.calculatePaginationMeta(totalItems, page, limit);
    
    return {
      data: mapInvestmentsToPublicDTOs(investments),
      meta
    };
  }

  /**
   * Get investment by ID
   * @param id - Investment ID
   * @returns Investment details
   */
  async getById(id: string): Promise<InvestmentPublicDTO> {
    logger.info(`Fetching investment with ID: ${id}`);
    try {
      const investment = await this.prisma.investment.findUnique({ where: { id } });
      if (!investment) {
        logger.warn(`Investment with ID ${id} not found`);
        throw new Error(`Investment with ID ${id} not found`);
      }
      logger.debug(`Found investment with ID: ${id}`);
      return mapInvestmentToPublicDTO(investment);
    } catch (error) {
      const errorObj = error as Error;
      logger.error(`Failed to retrieve investment: ${errorObj.message}`, { error });
      throw new Error(`Failed to retrieve investment: ${errorObj.message}`);
    }
  }

  /**
   * Update investment status
   * @param id - Investment ID
   * @param dto - Status update data
   * @returns Updated investment
   */
  async updateStatus(id: string, dto: InvestmentUpdateStatusDTO): Promise<InvestmentPublicDTO> {
    logger.info(`Updating investment status for ID: ${id} to ${dto.status}`);
    
    return await this.prisma.$transaction(async (tx) => {
      // Validate investment exists
      const investment = await tx.investment.findUnique({ where: { id } });
      if (!investment) {
        logger.warn(`Investment with ID ${id} not found`);
        throw new Error(`Investment with ID ${id} not found`);
      }
      
      // Prevent duplicate txHash if provided
      if (dto.txHash) {
        logger.debug(`Checking for duplicate transaction hash: ${dto.txHash}`);
        const existingWithTxHash = await tx.investment.findFirst({
          where: { txHash: dto.txHash, id: { not: id } },
        });
        if (existingWithTxHash) {
          logger.warn(`Transaction hash already exists: ${dto.txHash}`);
          throw new Error('Transaction hash already exists');
        }
      }
      
      // Validate status transition
      if (investment.status === 'CONFIRMED' && dto.status !== 'CONFIRMED') {
        logger.warn(`Cannot change status from CONFIRMED to ${dto.status}`);
        throw new Error('Cannot change status from CONFIRMED');
      }
      
      if (investment.status === 'CANCELLED' || investment.status === 'REFUNDED') {
        logger.warn(`Cannot update investment with status ${investment.status}`);
        throw new Error(`Cannot update investment with status ${investment.status}`);
      }
      
      logger.debug(`Status transition from ${investment.status} to ${dto.status} is valid`);
      
      // Update investment
      try {
        logger.debug(`Updating investment status in database`);
        const updated = await tx.investment.update({ 
          where: { id }, 
          data: { status: dto.status, txHash: dto.txHash } 
        });
        logger.info(`Successfully updated investment status to ${dto.status}`);
        return mapInvestmentToPublicDTO(updated);
      } catch (error) {
        const errorObj = error as Error;
        logger.error(`Failed to update investment status: ${errorObj.message}`, { error });
        throw new Error(`Failed to update investment status: ${errorObj.message}`);
      }
    });
  }
}