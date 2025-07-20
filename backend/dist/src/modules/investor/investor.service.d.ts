import { PrismaClient } from '@prisma/client';
import { InvestorApplicationDTO, InvestorUpdateDTO, InvestorVerificationUpdateDTO, WalletCreateDTO, WalletVerificationUpdateDTO, InvestorPublicDTO, WalletPublicDTO, InvestorListQuery } from './investor.types.js';
export declare class InvestorService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Apply as an investor
     * @param userId The ID of the user applying as an investor
     * @param dto The investor application data
     * @returns The created investor profile
     */
    applyAsInvestor(userId: string, dto: InvestorApplicationDTO): Promise<InvestorPublicDTO>;
    /**
     * Get investor profile by user ID
     * @param userId The ID of the user
     * @returns The investor profile or null if not found
     */
    getInvestorByUserId(userId: string): Promise<InvestorPublicDTO | null>;
    /**
     * Get investor profile by investor ID
     * @param id The ID of the investor
     * @returns The investor profile or null if not found
     */
    getInvestorById(id: string): Promise<InvestorPublicDTO | null>;
    /**
     * Update investor profile
     * @param id The ID of the investor to update
     * @param dto The investor update data
     * @returns The updated investor profile
     */
    updateInvestor(id: string, dto: InvestorUpdateDTO): Promise<InvestorPublicDTO>;
    /**
     * Update investor verification status
     * @param id The ID of the investor to update
     * @param dto The verification update data
     * @returns The updated investor profile
     */
    updateInvestorVerification(id: string, dto: InvestorVerificationUpdateDTO): Promise<InvestorPublicDTO>;
    /**
     * Get all investors with optional filtering and pagination
     * @param query Query parameters for filtering and pagination
     * @returns List of investor profiles
     */
    getAllInvestors(query: InvestorListQuery): Promise<InvestorPublicDTO[]>;
    /**
     * Count investors with optional filtering
     * @param query Query parameters for filtering
     * @returns Total count of matching investors
     */
    getInvestorCount(query: Omit<InvestorListQuery, 'limit' | 'offset'>): Promise<number>;
    /**
     * Add a new wallet to an investor
     * @param investorId The ID of the investor
     * @param dto The wallet creation data
     * @returns The created wallet
     */
    addWallet(investorId: string, dto: WalletCreateDTO): Promise<WalletPublicDTO>;
    /**
     * Get a wallet by ID
     * @param walletId The ID of the wallet
     * @returns The wallet or null if not found
     */
    getWalletById(walletId: string): Promise<WalletPublicDTO | null>;
    /**
     * Update wallet verification status
     * @param walletId The ID of the wallet to update
     * @param dto The verification update data
     * @returns The updated wallet
     */
    updateWalletVerification(walletId: string, dto: WalletVerificationUpdateDTO): Promise<WalletPublicDTO>;
    /**
     * Delete a wallet
     * @param walletId The ID of the wallet to delete
     * @returns True if the wallet was deleted, false otherwise
     */
    deleteWallet(walletId: string): Promise<boolean>;
    /**
     * Check if a user can apply as an investor
     * @param userId The ID of the user
     * @returns True if the user can apply, false otherwise
     */
    canUserApplyAsInvestor(userId: string): Promise<boolean>;
}
//# sourceMappingURL=investor.service.d.ts.map