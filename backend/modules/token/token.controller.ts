import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { TokenService } from './token.service.js';
import { tokenCreateSchema, tokenUpdateSchema } from './token.validators.js';
import { TokenCreateDTO, TokenUpdateDTO } from './token.types.js';
import { AuthenticatedRequest } from '../auth/requireAuth.js';

import { SmartContractService } from '../smart-contract/smartContract.service.js';
import { z } from 'zod';
import { validateAddress } from '../smart-contract/utils/contract.utils.js';

const BlockchainBalanceSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid contract address',
  }),
  walletAddress: z.string().refine(validateAddress, {
    message: 'Invalid wallet address',
  }),
});

export class TokenController {
  private smartContractService: SmartContractService;
  
  constructor(private prisma: PrismaClient, smartContractService?: SmartContractService) {
    // If smartContractService is provided, use it; otherwise it will be lazily initialized in the service
    this.smartContractService = smartContractService;
  }

  private getService() {
    return new TokenService(this.prisma, this.smartContractService);
  }

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parse = tokenCreateSchema.safeParse(req.body);
      if (!parse.success) return res.status(400).json({ success: false, error: 'ValidationError', message: parse.error.message });
      const token = await this.getService().create(parse.data as TokenCreateDTO);
      res.status(201).json({ success: true, data: token });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.name || 'Error', message: error.message });
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tokens = await this.getService().getAll(req.query);
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = await this.getService().getById(req.params.id);
      if (!token) return res.status(404).json({ success: false, error: 'NotFound', message: 'Token not found' });
      res.json({ success: true, data: token });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parse = tokenUpdateSchema.safeParse(req.body);
      if (!parse.success) return res.status(400).json({ success: false, error: 'ValidationError', message: parse.error.message });
      const updated = await this.getService().update(req.params.id, parse.data as TokenUpdateDTO);
      if (!updated) return res.status(404).json({ success: false, error: 'NotFound', message: 'Token not found' });
      res.json({ success: true, data: updated, message: 'Token updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.name || 'Error', message: error.message });
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.getService().delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'NotFound', message: 'Token not found or has investments' });
      res.json({ success: true, message: 'Token deleted' });
    } catch (error) {
      next(error);
    }
  };

  getAllPublic = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tokens = await this.getService().getAllPublic();
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  };
  
  getTokenBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parse = BlockchainBalanceSchema.safeParse(req.query);
      if (!parse.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parse.error.message 
        });
      }
      
      const { contractAddress, walletAddress } = parse.data;
      const balance = await this.getService().getTokenBalanceFromBlockchain(contractAddress, walletAddress);
      
      res.json({
        success: true,
        data: { balance }
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: error.name || 'Error', 
        message: error.message 
      });
    }
  };
  
  getBlockchainMetadata = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contractAddress = req.params.contractAddress;
      
      if (!validateAddress(contractAddress)) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid contract address'
        });
      }
      
      const metadata = await this.getService().getTokenMetadataFromBlockchain(contractAddress);
      
      res.json({
        success: true,
        data: metadata
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: error.name || 'Error', 
        message: error.message 
      });
    }
  };
}