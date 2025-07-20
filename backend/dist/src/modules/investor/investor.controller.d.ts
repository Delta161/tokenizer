import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/auth.types.js';
export declare class InvestorController {
    private prisma;
    constructor(prisma: PrismaClient);
    private getService;
    /**
     * Apply as an investor
     * @route POST /investors/apply
     */
    applyAsInvestor: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get current user's investor profile
     * @route GET /investors/me
     */
    getCurrentInvestorProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Update current user's investor profile
     * @route PATCH /investors/me
     */
    updateCurrentInvestorProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get investor profile by ID
     * @route GET /investors/:id
     */
    getInvestorProfileById: (req: Request, res: Response) => Promise<void>;
    /**
     * Get all investors
     * @route GET /investors
     */
    getAllInvestors: (req: Request, res: Response) => Promise<void>;
    /**
     * Update investor verification status
     * @route PATCH /investors/:id/verification
     */
    updateInvestorVerification: (req: Request, res: Response) => Promise<void>;
    /**
     * Add a wallet to current investor
     * @route POST /investors/me/wallets
     */
    addWallet: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Update wallet verification status
     * @route PATCH /investors/wallets/:walletId/verification
     */
    updateWalletVerification: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete a wallet
     * @route DELETE /investors/me/wallets/:walletId
     */
    deleteWallet: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=investor.controller.d.ts.map