import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvestorService } from './investor.service.js';
import {
  parseInvestorApplication,
  parseInvestorUpdate,
  parseInvestorVerificationUpdate,
  parseWalletCreate,
  parseWalletVerificationUpdate,
  parseInvestorIdParam,
  parseWalletIdParam,
  parseInvestorListQuery
} from './investor.validators.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';

export class InvestorController {
  constructor(private prisma: PrismaClient) {}

  private getService(): InvestorService {
    return new InvestorService(this.prisma);
  }

  /**
   * Apply as an investor
   * @route POST /investors/apply
   */
  applyAsInvestor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
        return;
      }

      const parseResult = parseInvestorApplication(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
        return;
      }

      // Check if user can apply as an investor
      const canApply = await this.getService().canUserApplyAsInvestor(userId);
      if (!canApply) {
        res.status(400).json({ success: false, error: 'BadRequest', message: 'User already has an investor profile' });
        return;
      }

      const investor = await this.getService().applyAsInvestor(userId, parseResult.data);
      res.status(201).json({
        success: true,
        data: investor,
        message: 'Investor profile created successfully'
      });
    } catch (error) {
      console.error('Error applying as investor:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Get current user's investor profile
   * @route GET /investors/me
   */
  getCurrentInvestorProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
        return;
      }

      const investor = await this.getService().getInvestorByUserId(userId);
      if (!investor) {
        res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
        return;
      }

      res.status(200).json({ success: true, data: investor });
    } catch (error) {
      console.error('Error getting current investor profile:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Update current user's investor profile
   * @route PATCH /investors/me
   */
  updateCurrentInvestorProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
        return;
      }

      const parseResult = parseInvestorUpdate(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
        return;
      }

      // Get investor ID from user ID
      const investor = await this.getService().getInvestorByUserId(userId);
      if (!investor) {
        res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
        return;
      }

      const updatedInvestor = await this.getService().updateInvestor(investor.id, parseResult.data);
      res.status(200).json({
        success: true,
        data: updatedInvestor,
        message: 'Investor profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating investor profile:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Get investor profile by ID
   * @route GET /investors/:id
   */
  getInvestorProfileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = parseInvestorIdParam(req.params);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
        return;
      }

      const investor = await this.getService().getInvestorById(parseResult.data.id);
      if (!investor) {
        res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
        return;
      }

      res.status(200).json({ success: true, data: investor });
    } catch (error) {
      console.error('Error getting investor profile by ID:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Get all investors
   * @route GET /investors
   */
  getAllInvestors = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = parseInvestorListQuery(req.query);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
        return;
      }

      const { limit, offset, ...filters } = parseResult.data;
      const investors = await this.getService().getAllInvestors({ limit, offset, ...filters });
      const total = await this.getService().getInvestorCount(filters);

      res.status(200).json({
        success: true,
        data: investors,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + investors.length < total
        }
      });
    } catch (error) {
      console.error('Error getting all investors:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Update investor verification status
   * @route PATCH /investors/:id/verification
   */
  updateInvestorVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseIdResult = parseInvestorIdParam(req.params);
      if (!parseIdResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseIdResult.error.message });
        return;
      }

      const parseBodyResult = parseInvestorVerificationUpdate(req.body);
      if (!parseBodyResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseBodyResult.error.message });
        return;
      }

      const investor = await this.getService().updateInvestorVerification(
        parseIdResult.data.id,
        parseBodyResult.data
      );

      res.status(200).json({
        success: true,
        data: investor,
        message: parseBodyResult.data.isVerified
          ? 'Investor verification approved'
          : 'Investor verification revoked'
      });
    } catch (error) {
      console.error('Error updating investor verification:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Add a wallet to current investor
   * @route POST /investors/me/wallets
   */
  addWallet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
        return;
      }

      const parseResult = parseWalletCreate(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
        return;
      }

      // Get investor ID from user ID
      const investor = await this.getService().getInvestorByUserId(userId);
      if (!investor) {
        res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
        return;
      }

      const wallet = await this.getService().addWallet(investor.id, parseResult.data);
      res.status(201).json({
        success: true,
        data: wallet,
        message: 'Wallet added successfully'
      });
    } catch (error) {
      console.error('Error adding wallet:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Update wallet verification status
   * @route PATCH /investors/wallets/:walletId/verification
   */
  updateWalletVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const parseIdResult = parseWalletIdParam(req.params);
      if (!parseIdResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseIdResult.error.message });
        return;
      }

      const parseBodyResult = parseWalletVerificationUpdate(req.body);
      if (!parseBodyResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseBodyResult.error.message });
        return;
      }

      const wallet = await this.getService().updateWalletVerification(
        parseIdResult.data.walletId,
        parseBodyResult.data
      );

      res.status(200).json({
        success: true,
        data: wallet,
        message: parseBodyResult.data.isVerified
          ? 'Wallet verification approved'
          : 'Wallet verification revoked'
      });
    } catch (error) {
      console.error('Error updating wallet verification:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Delete a wallet
   * @route DELETE /investors/me/wallets/:walletId
   */
  deleteWallet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
        return;
      }

      const parseResult = parseWalletIdParam(req.params);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
        return;
      }

      // Get investor ID from user ID
      const investor = await this.getService().getInvestorByUserId(userId);
      if (!investor) {
        res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
        return;
      }

      // Get wallet to check ownership
      const wallet = await this.getService().getWalletById(parseResult.data.walletId);
      if (!wallet) {
        res.status(404).json({ success: false, error: 'NotFound', message: 'Wallet not found' });
        return;
      }

      // Check if wallet belongs to the investor
      if (wallet.investorId !== investor.id) {
        res.status(403).json({ success: false, error: 'Forbidden', message: 'You do not have permission to delete this wallet' });
        return;
      }

      const success = await this.getService().deleteWallet(parseResult.data.walletId);
      if (!success) {
        res.status(404).json({ success: false, error: 'NotFound', message: 'Wallet not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Wallet deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting wallet:', error);
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };
}