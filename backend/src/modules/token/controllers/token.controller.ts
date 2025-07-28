import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { TokenService } from '../services/token.service';
import {
  safeParseTokenCreate,
  safeParseTokenUpdate,
  safeParseBlockchainBalance,
  safeParseTokenIdParams,
  safeParseContractAddressParams
} from '../validators/token.validator';
import { TokenCreateDTO, TokenUpdateDTO } from '../types/token.types';
import { AuthRequest } from '../../accounts/types/auth.types';
import { BlockchainService, getBlockchainConfig } from '../../blockchain/services/blockchain.service.js';
import { validateAddress } from '../../blockchain/utils/blockchain.utils.js';
import { tokenLogger } from '../utils/token.logger';

export class TokenController {
  private tokenService: TokenService;
  
  constructor(private prisma: PrismaClient, blockchainService?: BlockchainService) {
    this.tokenService = new TokenService(prisma, blockchainService);
  }

  /**
   * Create a new token
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = safeParseTokenCreate(req.body);
      
      if (!parseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parseResult.error.message 
        });
        return;
      }
      
      const token = await this.tokenService.create(parseResult.data as TokenCreateDTO);
      
      res.status(201).json({ 
        success: true, 
        data: token 
      });
    } catch (error: unknown) {
      tokenLogger.error('Error creating token', error);
      next(error);
    }
  };

  /**
   * Get all tokens with optional filtering
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.tokenService.getAll(req.query);
      
      res.json({
        success: true,
        data: tokens 
      });
    } catch (error: unknown) {
      tokenLogger.error('Error getting all tokens', error);
      next(error);
    }
  };
  
  /**
   * Get a token by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = safeParseTokenIdParams(req.params);
      
      if (!parseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parseResult.error.message 
        });
        return;
      }
      
      const { id } = parseResult.data;
      const token = await this.tokenService.getById(id);
      
      if (!token) {
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Token not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: token
      });
    } catch (error: unknown) {
      tokenLogger.error('Error getting token by ID', error);
      next(error);
    }
  };
  
  /**
   * Update a token
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idParseResult = safeParseTokenIdParams(req.params);
      
      if (!idParseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: idParseResult.error.message 
        });
        return;
      }
      
      const dataParseResult = safeParseTokenUpdate(req.body);
      
      if (!dataParseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: dataParseResult.error.message 
        });
        return;
      }
      
      const { id } = idParseResult.data;
      const token = await this.tokenService.update(id, dataParseResult.data as TokenUpdateDTO);
      
      if (!token) {
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Token not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: token
      });
    } catch (error: unknown) {
      tokenLogger.error('Error updating token', error);
      next(error);
    }
  };
  
  /**
   * Delete a token
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = safeParseTokenIdParams(req.params);
      
      if (!parseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parseResult.error.message 
        });
        return;
      }
      
      const { id } = parseResult.data;
      const success = await this.tokenService.delete(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Token not found or cannot be deleted'
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'Token deleted successfully'
      });
    } catch (error: unknown) {
      tokenLogger.error('Error deleting token', error);
      next(error);
    }
  };
  
  /**
   * Get all public tokens
   */
  getAllPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.tokenService.getAllPublic();
      
      res.json({
        success: true,
        data: tokens 
      });
    } catch (error: unknown) {
      tokenLogger.error('Error getting public tokens', error);
      next(error);
    }
  };
  
  /**
   * Get token balance from blockchain
   */
  getTokenBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = safeParseBlockchainBalance(req.query);
      
      if (!parseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parseResult.error.message 
        });
        return;
      }
      
      const { contractAddress, walletAddress } = parseResult.data;
      
      const token = await this.tokenService.getTokenByContractAddress(contractAddress);
      
      if (token && !token.isActive) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Token is not active'
        });
        return;
      }
      
      const balance = await this.tokenService.getTokenBalanceFromBlockchain(contractAddress, walletAddress);
      
      res.json({
        success: true,
        data: { balance }
      });
    } catch (error: unknown) {
      tokenLogger.error('Error getting token balance', error);
      next(error);
    }
  };
  
  /**
   * Get token metadata from blockchain
   */
  getBlockchainMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = safeParseContractAddressParams(req.params);
      
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: parseResult.error.message
        });
        return;
      }
      
      const { contractAddress } = parseResult.data;
      
      const metadata = await this.tokenService.getTokenMetadataFromBlockchain(contractAddress);
      
      res.json({
        success: true,
        data: metadata
      });
    } catch (error: unknown) {
      tokenLogger.error('Error getting blockchain metadata', error);
      next(error);
    }
  };
}