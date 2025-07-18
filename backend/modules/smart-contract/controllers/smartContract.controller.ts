import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { SmartContractService } from '../smartContract.service.js';
import { validateAddress } from '../utils/contract.utils.js';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const TokenMetadataSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
});

const BalanceOfSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
  userWallet: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum wallet address',
  }),
});

const MintTokensSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
  recipient: z.string().refine(validateAddress, {
    message: 'Invalid recipient address',
  }),
  amount: z.string().or(z.number()).transform(val => new Decimal(val.toString())),
});

const TransferTokensSchema = z.object({
  contractAddress: z.string().refine(validateAddress, {
    message: 'Invalid Ethereum contract address',
  }),
  recipient: z.string().refine(validateAddress, {
    message: 'Invalid recipient address',
  }),
  amount: z.string().or(z.number()).transform(val => new Decimal(val.toString())),
});

export class SmartContractController {
  constructor(
    private smartContractService: SmartContractService,
    private prisma: PrismaClient
  ) {}

  async validateContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress } = req.params;
      const isValid = this.smartContractService.validateContract(contractAddress);
      return res.json({ success: true, data: { isValid } });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async getTokenMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress } = TokenMetadataSchema.parse(req.params);
      const metadata = await this.smartContractService.getTokenMetadata(contractAddress);
      return res.json({ success: true, data: metadata });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async getBalanceOf(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress, userWallet } = BalanceOfSchema.parse(req.query);
      const balance = await this.smartContractService.getBalanceOf(contractAddress, userWallet);
      return res.json({ success: true, data: { balance: balance.toString() } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async mintTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress, recipient, amount } = MintTokensSchema.parse(req.body);
      
      // Verify token exists in database
      const token = await this.prisma.token.findUnique({
        where: { contractAddress },
      });
      
      if (!token) {
        return res.status(404).json({ success: false, error: 'Token not found in database' });
      }
      
      const txHash = await this.smartContractService.mintTokens(contractAddress, recipient, amount);
      return res.json({ success: true, data: { txHash } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async transferTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress, recipient, amount } = TransferTokensSchema.parse(req.body);
      
      // Verify token exists in database
      const token = await this.prisma.token.findUnique({
        where: { contractAddress },
      });
      
      if (!token) {
        return res.status(404).json({ success: false, error: 'Token not found in database' });
      }
      
      const txHash = await this.smartContractService.transferTokens(contractAddress, recipient, amount);
      return res.json({ success: true, data: { txHash } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}