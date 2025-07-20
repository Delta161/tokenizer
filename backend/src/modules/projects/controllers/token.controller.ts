import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { TokenService } from '../services/token.service';
import {
  safeParseTokenCreate,
  safeParseTokenUpdate,
  safeParseBlockchainBalance,
  safeParseTokenIdParams,
  safeParseContractAddressParams,
  safeParseTokenListQuery
} from '../validators/token.validators';
import { TokenCreateDTO, TokenUpdateDTO } from '../types/projects.types';
import { AuthRequest } from '../../accounts/types/auth.types';
import { BlockchainService, getBlockchainConfig } from '../../blockchain/services/blockchain.service.js';
import { validateAddress } from '../../blockchain/utils/blockchain.utils.js';

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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ 
        success: false, 
        error: 'Error', 
        message: errorMessage 
      });
    }
  };

  /**
   * Update a token
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
      
      const parseResult = safeParseTokenUpdate(req.body);
      
      if (!parseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parseResult.error.message 
        });
        return;
      }
      
      const token = await this.tokenService.update(
        idParseResult.data.id,
        parseResult.data as TokenUpdateDTO
      );
      
      res.status(200).json({ 
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
      
      const token = await this.tokenService.getById(parseResult.data.id);
      
      if (!token) {
        res.status(404).json({ 
          success: false, 
          error: 'NotFound', 
          message: 'Token not found' 
        });
        return;
      }
      
      res.status(200).json({ 
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
   * List tokens with optional filtering
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = safeParseTokenListQuery(req.query);
      
      if (!parseResult.success) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parseResult.error.message 
        });
        return;
      }
      
      const tokens = await this.tokenService.list(parseResult.data);
      
      res.status(200).json({ 
        success: true, 
        data: tokens 
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
   * Get token balance for a wallet address
   */
  getBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      // Validate addresses
      if (!validateAddress(contractAddress) || !validateAddress(walletAddress)) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: 'Invalid Ethereum address format' 
        });
        return;
      }
      
      const balance = await this.tokenService.getTokenBalance(contractAddress, walletAddress);
      
      res.status(200).json({ 
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
  getMetadata = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      // Validate address
      if (!validateAddress(contractAddress)) {
        res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: 'Invalid Ethereum address format' 
        });
        return;
      }
      
      const metadata = await this.tokenService.getTokenMetadata(contractAddress);
      
      res.status(200).json({ 
        success: true, 
        data: metadata 
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
}
