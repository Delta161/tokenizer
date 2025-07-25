import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { BlockchainService } from '../services/blockchain.service.js';
import { validateAddress, validateTxHash } from '../utils/blockchain.utils.js';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { DEFAULT_CHAIN_ID, getNetworkConfig, NETWORKS } from '../config/blockchain.config.js';

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

export class BlockchainController {
  constructor(
    private blockchainService: BlockchainService,
    private prisma: PrismaClient
  ) {}

  async validateContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress } = TokenMetadataSchema.parse(req.params);
      
      // Check if contract exists in database
      const token = await this.prisma.token.findFirst({
        where: { contractAddress }
      });

      const validationResult = await this.blockchainService.validateContract(contractAddress);
      
      return res.json({
        success: true,
        data: {
          ...validationResult,
          existsInDatabase: !!token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress } = TokenMetadataSchema.parse(req.params);
      const metadata = await this.blockchainService.getTokenMetadata(contractAddress);
      return res.json({ success: true, data: metadata });
    } catch (error) {
      next(error);
    }
  }

  async getBalanceOf(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress, userWallet } = BalanceOfSchema.parse(req.query);
      const balance = await this.blockchainService.getBalanceOf(contractAddress, userWallet);
      return res.json({ success: true, data: { balance: balance.toString() } });
    } catch (error) {
      next(error);
    }
  }

  async getGasPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const gasPrice = await this.blockchainService.getGasPrice();
      return res.json({ success: true, data: { gasPrice: gasPrice.toString() } });
    } catch (error) {
      next(error);
    }
  }

  async getNetworkConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : DEFAULT_CHAIN_ID;
      const networkConfig = getNetworkConfig(chainId);
      return res.json({ success: true, data: networkConfig });
    } catch (error) {
      next(error);
    }
  }

  async mintTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress, recipient, amount } = MintTokensSchema.parse(req.body);
      const result = await this.blockchainService.mintTokens(contractAddress, recipient, amount);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async transferTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractAddress, recipient, amount } = TransferTokensSchema.parse(req.body);
      const result = await this.blockchainService.transferTokens(contractAddress, recipient, amount);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { txHash } = TransactionHashSchema.parse(req.body);
      const receipt = await this.blockchainService.getTransactionReceipt(txHash);
      return res.json({ success: true, data: receipt });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableContracts(req: Request, res: Response, next: NextFunction) {
    try {
      const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : DEFAULT_CHAIN_ID;
      const contracts = this.blockchainService.getAvailableContracts(chainId);
      return res.json({ success: true, data: contracts });
    } catch (error) {
      next(error);
    }
  }

  async getContractAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractName } = req.params;
      const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : DEFAULT_CHAIN_ID;
      
      if (!contractName) {
        return res.status(400).json({ success: false, error: 'Contract name is required' });
      }
      
      const address = this.blockchainService.getContractAddress(contractName, chainId);
      return res.json({ success: true, data: { contractName, address, chainId } });
    } catch (error) {
      next(error);
    }
  }
}