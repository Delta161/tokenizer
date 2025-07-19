import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { TokenService } from './token.service';
import {
  safeParseTokenCreate,
  safeParseTokenUpdate,
  safeParseBlockchainBalance,
  safeParseTokenIdParams,
  safeParseContractAddressParams
} from './token.validators';
import { TokenCreateDTO, TokenUpdateDTO } from './token.types';
import { AuthRequest } from '../auth/auth.types';
import { SmartContractService, getSmartContractConfig } from '../../services/smartContract.service';
import { validateAddress } from '../../utils/contract.utils';

export class TokenController {
  private tokenService: TokenService;
  
  constructor(private prisma: PrismaClient, smartContractService?: SmartContractService) {
    this.tokenService = new TokenService(prisma, smartContractService);
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ 
        success: false, 
        error: 'Error', 
        message: errorMessage 
      });
    }
  };

  /**
   * Get all tokens (admin)
   */
  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.tokenService.getAll(req.query);
      
      res.json({ 
        success: true, 
        data: tokens 
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get a token by ID
   */
  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
      
      const token = await this.tokenService.getById(parseResult.data.id);
      
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
      next(error);
    }
  };

  /**
   * Update a token
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramsResult = safeParseTokenIdParams(req.params);
      
      if (!paramsResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: paramsResult.error.message 
        });
        return;
      }
      
      const parseResult = safeParseTokenUpdate(req.body);
      
      if (!parseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parseResult.error.message 
        });
        return;
      }
      
      const updated = await this.tokenService.update(
        paramsResult.data.id, 
        parseResult.data as TokenUpdateDTO
      );
      
      if (!updated) {
        res.status(404).json({ 
          success: false, 
          error: 'NotFound', 
          message: 'Token not found' 
        });
        return;
      }
      
      res.json({ 
        success: true, 
        data: updated, 
        message: 'Token updated' 
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ 
        success: false, 
        error: 'Error', 
        message: errorMessage 
      });
    }
  };

  /**
   * Delete a token
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
      
      const deleted = await this.tokenService.delete(parseResult.data.id);
      
      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          error: 'NotFound', 
          message: 'Token not found or has investments' 
        });
        return;
      }
      
      res.json({ 
        success: true, 
        message: 'Token deleted' 
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get all public tokens (for investors)
   */
  getAllPublic = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.tokenService.getAllPublic();
      
      res.json({ 
        success: true, 
        data: tokens 
      });
    } catch (error: unknown) {
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ 
        success: false, 
        error: 'Error', 
        message: errorMessage 
      });
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ 
        success: false, 
        error: 'Error', 
        message: errorMessage 
      });
    }
  };
}