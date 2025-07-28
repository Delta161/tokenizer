import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvestorService } from '../services/investor.service.js';
import {
  parseInvestorApplication,
  parseInvestorUpdate,
  parseInvestorVerificationUpdate,
  parseWalletCreate,
  parseWalletVerificationUpdate,
  parseInvestorIdParam,
  parseWalletIdParam,
  parseInvestorListQuery
} from '../validators/investor.validator.js';
import { AuthenticatedRequest } from '../../accounts/types/auth.types.js';
import { createPaginationResult, getSkipValue } from '@utils/pagination';
import { investorLogger } from '../utils/investor.logger.js';

export class InvestorController {
  private prisma?: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma;
  }

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
      investorLogger.error('Error applying as investor', error instanceof Error ? error : new Error(String(error)));
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
      investorLogger.error('Error getting current investor profile', error instanceof Error ? error : new Error(String(error)));
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
      investorLogger.error('Error updating investor profile', error instanceof Error ? error : new Error(String(error)));
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
      investorLogger.error('Error getting investor profile by ID', error instanceof Error ? error : new Error(String(error)));
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

      const { page, limit, sortBy, sortOrder, ...filters } = parseResult.data;
      const { investors, total } = await this.getService().getAllInvestors({ page, limit, sortBy, sortOrder, ...filters });

      const result = createPaginationResult({
        data: investors,
        total,
        page,
        limit,
        skip: getSkipValue(page, limit)
      });

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      investorLogger.error('Error getting all investors', error instanceof Error ? error : new Error(String(error)));
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

      const parseDataResult = parseInvestorVerificationUpdate(req.body);
      if (!parseDataResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseDataResult.error.message });
        return;
      }

      const updatedInvestor = await this.getService().updateInvestorVerification(
        parseIdResult.data.id,
        parseDataResult.data
      );

      res.status(200).json({
        success: true,
        data: updatedInvestor,
        message: 'Investor verification status updated successfully'
      });
    } catch (error) {
      investorLogger.error('Error updating investor verification', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Add a wallet to the current investor's profile
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
      investorLogger.error('Error adding wallet', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  /**
   * Delete a wallet from the current investor's profile
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

      // Check if wallet belongs to this investor
      const walletBelongsToInvestor = await this.getService().walletBelongsToInvestor(
        parseResult.data.walletId,
        investor.id
      );

      if (!walletBelongsToInvestor) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to delete this wallet'
        });
        return;
      }

      await this.getService().deleteWallet(parseResult.data.walletId);
      res.status(200).json({
        success: true,
        message: 'Wallet deleted successfully'
      });
    } catch (error) {
      investorLogger.error('Error deleting wallet', error instanceof Error ? error : new Error(String(error)));
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

      const parseDataResult = parseWalletVerificationUpdate(req.body);
      if (!parseDataResult.success) {
        res.status(400).json({ success: false, error: 'ValidationError', message: parseDataResult.error.message });
        return;
      }

      const updatedWallet = await this.getService().updateWalletVerification(
        parseIdResult.data.walletId,
        parseDataResult.data
      );

      res.status(200).json({
        success: true,
        data: updatedWallet,
        message: 'Wallet verification status updated successfully'
      });
    } catch (error) {
      investorLogger.error('Error updating wallet verification', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        success: false,
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };
}