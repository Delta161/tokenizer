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
} from '../types/investor.types.js';
import {
  mapInvestorToPublicDTO,
  mapInvestorsToPublicDTOs,
  mapWalletToPublicDTO
} from '../utils/investor.mapper.js';
import { prisma as sharedPrisma } from '../utils/prisma';
import { PAGINATION } from '@config/constants';
import { getSkipValue } from '@utils/pagination';
import { investorLogger } from '../utils/investor.logger.js';

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

    investorLogger.info('Investor profile created', { investorId: investor.id, userId });
    return mapInvestorToPublicDTO(investor);
  }

  /**
   * Check if a user can apply as an investor
   * @param userId The ID of the user
   * @returns True if the user can apply, false otherwise
   */
  async canUserApplyAsInvestor(userId: string): Promise<boolean> {
    const existingInvestor = await this.prisma.investor.findUnique({
      where: { userId },
    });

    return !existingInvestor;
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
   * Get all investors with pagination and filtering
   * @param options Pagination and filtering options
   * @returns Array of investor profiles and total count
   */
  async getAllInvestors(options: InvestorListQuery & {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ investors: InvestorPublicDTO[]; total: number }> {
    const { page, limit, sortBy, sortOrder, isVerified, country } = options;
    const skip = getSkipValue(page, limit);

    // Build where clause for filtering
    const where: any = {};
    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }
    if (country) {
      where.country = country;
    }

    // Build orderBy clause for sorting
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Get investors with pagination
    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { wallets: true }
      }),
      this.prisma.investor.count({ where })
    ]);

    return {
      investors: mapInvestorsToPublicDTOs(investors),
      total
    };
  }

  /**
   * Update investor profile
   * @param id The ID of the investor
   * @param dto The update data
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

    investorLogger.info('Investor profile updated', { investorId: id });
    return mapInvestorToPublicDTO(investor);
  }

  /**
   * Update investor verification status
   * @param id The ID of the investor
   * @param dto The verification update data
   * @returns The updated investor profile
   */
  async updateInvestorVerification(
    id: string,
    dto: InvestorVerificationUpdateDTO
  ): Promise<InvestorPublicDTO> {
    const investor = await this.prisma.investor.update({
      where: { id },
      data: {
        isVerified: dto.isVerified,
        verificationMethod: dto.verificationMethod,
        verifiedAt: dto.isVerified ? new Date() : null,
      },
      include: { wallets: true }
    });

    // Log the verification status change
    await this.prisma.auditLogEntry.create({
      data: {
        userId: investor.userId,
        actionType: 'INVESTOR_UPDATED',
        entityType: 'Investor',
        entityId: investor.id,
        metadata: {
          action: 'investor_verification_updated',
          isVerified: dto.isVerified,
          verificationMethod: dto.verificationMethod
        }
      }
    });

    investorLogger.info('Investor verification status updated', {
      investorId: id,
      isVerified: dto.isVerified,
      verificationMethod: dto.verificationMethod
    });

    return mapInvestorToPublicDTO(investor);
  }

  /**
   * Add a wallet to an investor's profile
   * @param investorId The ID of the investor
   * @param dto The wallet creation data
   * @returns The created wallet
   */
  async addWallet(investorId: string, dto: WalletCreateDTO): Promise<WalletPublicDTO> {
    // Check if wallet with this address already exists
    const existingWallet = await this.prisma.wallet.findFirst({
      where: {
        address: dto.address,
        blockchain: dto.blockchain
      }
    });

    if (existingWallet) {
      throw new Error('Wallet with this address already exists');
    }

    // Create new wallet
    const wallet = await this.prisma.wallet.create({
      data: {
        investorId,
        address: dto.address,
        blockchain: dto.blockchain,
      }
    });

    // Log the action
    await this.prisma.auditLogEntry.create({
      data: {
        entityType: 'Wallet',
        entityId: wallet.id,
        actionType: 'WALLET_CREATED',
        metadata: {
          investorId,
          address: dto.address,
          blockchain: dto.blockchain
        }
      }
    });

    investorLogger.info('Wallet added to investor profile', {
      investorId,
      walletId: wallet.id,
      address: dto.address,
      blockchain: dto.blockchain
    });

    return mapWalletToPublicDTO(wallet);
  }

  /**
   * Delete a wallet from an investor's profile
   * @param walletId The ID of the wallet to delete
   */
  async deleteWallet(walletId: string): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Delete the wallet
    await this.prisma.wallet.delete({
      where: { id: walletId }
    });

    // Log the action
    await this.prisma.auditLogEntry.create({
      data: {
        entityType: 'Wallet',
        entityId: walletId,
        actionType: 'WALLET_DELETED',
        metadata: {
          investorId: wallet.investorId,
          address: wallet.address,
          blockchain: wallet.blockchain
        }
      }
    });

    investorLogger.info('Wallet deleted from investor profile', {
      investorId: wallet.investorId,
      walletId,
      address: wallet.address,
      blockchain: wallet.blockchain
    });
  }

  /**
   * Check if a wallet belongs to an investor
   * @param walletId The ID of the wallet
   * @param investorId The ID of the investor
   * @returns True if the wallet belongs to the investor, false otherwise
   */
  async walletBelongsToInvestor(walletId: string, investorId: string): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId }
    });

    return wallet?.investorId === investorId;
  }

  /**
   * Update wallet verification status
   * @param walletId The ID of the wallet
   * @param dto The verification update data
   * @returns The updated wallet
   */
  async updateWalletVerification(
    walletId: string,
    dto: WalletVerificationUpdateDTO
  ): Promise<WalletPublicDTO> {
    const wallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        isVerified: dto.isVerified,
        verifiedAt: dto.isVerified ? new Date() : null,
      }
    });

    // Log the verification status change
    await this.prisma.auditLogEntry.create({
      data: {
        entityType: 'Wallet',
        entityId: wallet.id,
        actionType: 'WALLET_UPDATED',
        metadata: {
          action: 'wallet_verification_updated',
          investorId: wallet.investorId,
          isVerified: dto.isVerified
        }
      }
    });

    investorLogger.info('Wallet verification status updated', {
      walletId,
      investorId: wallet.investorId,
      isVerified: dto.isVerified
    });

    return mapWalletToPublicDTO(wallet);
  }
}