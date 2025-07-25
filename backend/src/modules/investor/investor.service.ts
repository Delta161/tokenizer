import { PrismaClient, Investor, Wallet, Blockchain } from '@prisma/client';
import {
  InvestorApplicationDTO,
  InvestorUpdateDTO,
  InvestorVerificationUpdateDTO,
  WalletCreateDTO,
  WalletVerificationUpdateDTO,
  InvestorPublicDTO,
  WalletPublicDTO,
  InvestorListQuery
} from './investor.types.js';
import {
  mapInvestorToPublicDTO,
  mapInvestorsToPublicDTOs,
  mapWalletToPublicDTO
} from './investor.mapper.js';
import { prisma as sharedPrisma } from './utils/prisma';
import { PAGINATION } from '@config/constants';
import { getSkipValue } from '@utils/pagination';

export class InvestorService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || sharedPrisma;
  }

  /**
   * Apply as an investor
   * @param userId The ID of the user applying as an investor
   * @param dto The investor application data
   * @returns The created investor profile
   */
  async applyAsInvestor(userId: string, dto: InvestorApplicationDTO): Promise<InvestorPublicDTO> {
    // Check if user already has an investor profile
    const existingInvestor = await this.prisma.investor.findUnique({
      where: { userId },
      include: { wallets: true }
    });

    if (existingInvestor) {
      throw new Error('User already has an investor profile');
    }

    // Create new investor profile
    const investor = await this.prisma.investor.create({
      data: {
        userId,
        nationality: dto.nationality,
        country: dto.country,
        dateOfBirth: dto.dateOfBirth,
        institutionName: dto.institutionName,
        vatNumber: dto.vatNumber,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        city: dto.city,
        postalCode: dto.postalCode,
      },
      include: { wallets: true }
    });

    // Update user role to INVESTOR if not already
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'INVESTOR' }
    });

    // Log the action
    await this.prisma.auditLogEntry.create({
      data: {
        userId,
        actionType: 'USER_UPDATED',
        entityType: 'Investor',
        entityId: investor.id,
        metadata: { action: 'investor_profile_created' }
      }
    });

    return mapInvestorToPublicDTO(investor);
  }

  /**
   * Get investor profile by user ID
   * @param userId The ID of the user
   * @returns The investor profile or null if not found
   */
  async getInvestorByUserId(userId: string): Promise<InvestorPublicDTO | null> {
    const investor = await this.prisma.investor.findUnique({
      where: { userId },
      include: { wallets: true }
    });

    return investor ? mapInvestorToPublicDTO(investor) : null;
  }

  /**
   * Get investor profile by investor ID
   * @param id The ID of the investor
   * @returns The investor profile or null if not found
   */
  async getInvestorById(id: string): Promise<InvestorPublicDTO | null> {
    const investor = await this.prisma.investor.findUnique({
      where: { id },
      include: { wallets: true }
    });

    return investor ? mapInvestorToPublicDTO(investor) : null;
  }

  /**
   * Update investor profile
   * @param id The ID of the investor to update
   * @param dto The investor update data
   * @returns The updated investor profile
   */
  async updateInvestor(id: string, dto: InvestorUpdateDTO): Promise<InvestorPublicDTO> {
    const investor = await this.prisma.investor.update({
      where: { id },
      data: {
        nationality: dto.nationality,
        dateOfBirth: dto.dateOfBirth,
        institutionName: dto.institutionName,
        vatNumber: dto.vatNumber,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        postalCode: dto.postalCode,
      },
      include: { wallets: true }
    });

    // Log the action
    await this.prisma.auditLogEntry.create({
      data: {
        userId: investor.userId,
        actionType: 'USER_UPDATED',
        entityType: 'Investor',
        entityId: investor.id,
        metadata: { action: 'investor_profile_updated' }
      }
    });

    return mapInvestorToPublicDTO(investor);
  }

  /**
   * Update investor verification status
   * @param id The ID of the investor to update
   * @param dto The verification update data
   * @returns The updated investor profile
   */
  async updateInvestorVerification(id: string, dto: InvestorVerificationUpdateDTO): Promise<InvestorPublicDTO> {
    const investor = await this.prisma.investor.update({
      where: { id },
      data: {
        isVerified: dto.isVerified,
        verificationMethod: dto.verificationMethod,
        verifiedAt: dto.isVerified ? new Date() : null,
      },
      include: { wallets: true }
    });

    // Log the action
    await this.prisma.auditLogEntry.create({
      data: {
        userId: investor.userId,
        actionType: 'USER_UPDATED',
        entityType: 'Investor',
        entityId: investor.id,
        metadata: { 
          action: dto.isVerified ? 'investor_verified' : 'investor_verification_revoked',
          method: dto.verificationMethod
        }
      }
    });

    return mapInvestorToPublicDTO(investor);
  }

  /**
   * Get all investors with optional filtering and pagination
   * @param query Query parameters for filtering and pagination
   * @returns List of investor profiles and total count
   */
  async getAllInvestors(query: InvestorListQuery): Promise<{ investors: InvestorPublicDTO[], total: number }> {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, sortBy, sortOrder = 'desc', isVerified, country } = query;
    const skip = getSkipValue(page, limit);

    // Build where clause based on filters
    const where: any = {};
    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }
    if (country) {
      where.country = country;
    }

    // Build orderBy based on sort options
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get investors and total count in parallel
    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where,
        include: { wallets: true },
        take: limit,
        skip,
        orderBy
      }),
      this.prisma.investor.count({ where })
    ]);

    return { 
      investors: mapInvestorsToPublicDTOs(investors),
      total
    };
  }

  /**
   * Count investors with optional filtering
   * @param query Query parameters for filtering
   * @returns Total count of matching investors
   */
  async getInvestorCount(query: Omit<InvestorListQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>): Promise<number> {
    const { isVerified, country } = query;
    
    // Build where clause based on filters
    const where: any = {};
    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }
    if (country) {
      where.country = country;
    }
    
    return this.prisma.investor.count({ where });
  }

  /**
   * Add a new wallet to an investor
   * @param investorId The ID of the investor
   * @param dto The wallet creation data
   * @returns The created wallet
   */
  async addWallet(investorId: string, dto: WalletCreateDTO): Promise<WalletPublicDTO> {
    // Check if wallet address already exists
    const existingWallet = await this.prisma.wallet.findUnique({
      where: { address: dto.address }
    });

    if (existingWallet) {
      throw new Error('Wallet address already exists');
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        investorId,
        address: dto.address,
        blockchain: dto.blockchain,
      }
    });

    // Log the action
    const investor = await this.prisma.investor.findUnique({
      where: { id: investorId }
    });

    if (investor) {
      await this.prisma.auditLogEntry.create({
        data: {
          userId: investor.userId,
          actionType: 'USER_UPDATED',
          entityType: 'Wallet',
          entityId: wallet.id,
          metadata: { 
            action: 'wallet_added',
            blockchain: dto.blockchain,
            address: dto.address
          }
        }
      });
    }

    return mapWalletToPublicDTO(wallet);
  }

  /**
   * Get a wallet by ID
   * @param walletId The ID of the wallet
   * @returns The wallet or null if not found
   */
  async getWalletById(walletId: string): Promise<WalletPublicDTO | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId }
    });

    return wallet ? mapWalletToPublicDTO(wallet) : null;
  }

  /**
   * Update wallet verification status
   * @param walletId The ID of the wallet to update
   * @param dto The verification update data
   * @returns The updated wallet
   */
  async updateWalletVerification(walletId: string, dto: WalletVerificationUpdateDTO): Promise<WalletPublicDTO> {
    const wallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        isVerified: dto.isVerified,
        verifiedAt: dto.isVerified ? new Date() : null,
      }
    });

    // Log the action
    const investor = await this.prisma.investor.findUnique({
      where: { id: wallet.investorId }
    });

    if (investor) {
      await this.prisma.auditLogEntry.create({
        data: {
          userId: investor.userId,
          actionType: 'WALLET_VERIFIED',
          entityType: 'Wallet',
          entityId: wallet.id,
          metadata: { 
            action: dto.isVerified ? 'wallet_verified' : 'wallet_verification_revoked',
            address: wallet.address
          }
        }
      });
    }

    return mapWalletToPublicDTO(wallet);
  }

  /**
   * Delete a wallet
   * @param walletId The ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  async deleteWallet(walletId: string): Promise<boolean> {
    // Check if wallet exists
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      return false;
    }

    // Check if wallet has associated investments
    const investmentCount = await this.prisma.investment.count({
      where: { walletId }
    });

    if (investmentCount > 0) {
      throw new Error('Cannot delete wallet with associated investments');
    }

    // Get investor for audit logging
    const investor = await this.prisma.investor.findUnique({
      where: { id: wallet.investorId }
    });

    // Delete the wallet
    await this.prisma.wallet.delete({
      where: { id: walletId }
    });

    // Log the action
    if (investor) {
      await this.prisma.auditLogEntry.create({
        data: {
          userId: investor.userId,
          actionType: 'USER_UPDATED',
          entityType: 'Wallet',
          entityId: walletId,
          metadata: { 
            action: 'wallet_deleted',
            address: wallet.address
          }
        }
      });
    }

    return true;
  }

  /**
   * Check if a user can apply as an investor
   * @param userId The ID of the user
   * @returns True if the user can apply, false otherwise
   */
  async canUserApplyAsInvestor(userId: string): Promise<boolean> {
    const investor = await this.prisma.investor.findUnique({
      where: { userId }
    });

    return !investor;
  }
}