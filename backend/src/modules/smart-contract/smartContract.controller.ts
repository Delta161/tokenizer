import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { SmartContractService } from './smartContract.service.js';
import { validateAddress, validateTxHash } from './smartContract.utils.js';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { DEFAULT_CHAIN_ID, getNetworkConfig } from './smartContract.config.js';

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

const TransactionHashSchema = z.object({
  txHash: z.string().refine(validateTxHash, {
    message: 'Invalid transaction hash',
  }),
});

export class SmartContractController {
  constructor(
    private smartContractService: SmartContractService,
    private prisma: PrismaClient
  ) {}

  async validateContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress } = TokenMetadataSchema.parse(req.params);
      
      // Check if contract exists in database
      const token = await this.prisma.token.findFirst({
        where: { contractAddress }
      });

      const validationResult = await this.smartContractService.validateContract(contractAddress);
      
      return res.json({
        success: true,
        data: {
          ...validationResult,
          existsInDatabase: !!token
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
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

  async getGasPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const gasPrice = await this.smartContractService.getGasPrice();
      return res.json({ success: true, data: { gasPrice: gasPrice.toString() } });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async getNetworkConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : DEFAULT_CHAIN_ID;
      const networkConfig = getNetworkConfig(chainId);
      return res.json({ success: true, data: networkConfig });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async mintTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress, recipient, amount } = MintTokensSchema.parse(req.body);
      const result = await this.smartContractService.mintTokens(contractAddress, recipient, amount);
      return res.json({ success: true, data: result });
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
      const result = await this.smartContractService.transferTokens(contractAddress, recipient, amount);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async getTransactionReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { txHash } = TransactionHashSchema.parse(req.body);
      const receipt = await this.smartContractService.getTransactionReceipt(txHash);
      return res.json({ success: true, data: receipt });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}