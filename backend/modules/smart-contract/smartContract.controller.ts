import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SmartContractService } from './smartContract.service.js';
import { DEFAULT_CHAIN_ID, getNetworkConfig } from './config/smartContract.config.js';
import { 
  ContractAddressSchema,
  BalanceQuerySchema,
  MintTokensSchema,
  TransferTokensSchema,
  TransactionHashSchema
} from './validators/smartContract.validators.js';

export class SmartContractController {
  private smartContractService: SmartContractService;
  private prisma: PrismaClient;

  constructor(smartContractService: SmartContractService, prisma: PrismaClient) {
    this.smartContractService = smartContractService;
    this.prisma = prisma;
  }

  /**
   * Validates a contract address
   * @param req Express request
   * @param res Express response
   */
  async validateContract(req: Request, res: Response): Promise<void> {
    try {
      const { contractAddress } = ContractAddressSchema.parse(req.body);
      
      // Check if contract exists in database
      const token = await this.prisma.token.findFirst({
        where: { contractAddress }
      });

      const validationResult = await this.smartContractService.validateContract(contractAddress);
      
      res.json({
        success: true,
        data: {
          ...validationResult,
          existsInDatabase: !!token
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets token metadata
   * @param req Express request
   * @param res Express response
   */
  async getTokenMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { contractAddress } = ContractAddressSchema.parse(req.body);
      
      // Check if contract exists in database
      const token = await this.prisma.token.findFirst({
        where: { contractAddress }
      });

      if (!token) {
        res.status(404).json({
          success: false,
          error: 'Token not found in database'
        });
        return;
      }

      const metadata = await this.smartContractService.getTokenMetadata(contractAddress);
      
      res.json({
        success: true,
        data: metadata
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets token balance for a wallet
   * @param req Express request
   * @param res Express response
   */
  async getBalanceOf(req: Request, res: Response): Promise<void> {
    try {
      const { contractAddress, userWallet } = BalanceQuerySchema.parse(req.body);
      
      // Check if contract exists in database
      const token = await this.prisma.token.findFirst({
        where: { contractAddress }
      });

      if (!token) {
        res.status(404).json({
          success: false,
          error: 'Token not found in database'
        });
        return;
      }

      const balance = await this.smartContractService.getBalanceOf(contractAddress, userWallet);
      
      res.json({
        success: true,
        data: {
          balance: balance.toString(),
          tokenId: token.id,
          symbol: token.symbol
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Mints tokens to a recipient
   * @param req Express request
   * @param res Express response
   */
  async mintTokens(req: Request, res: Response): Promise<void> {
    try {
      const { contractAddress, recipient, amount } = MintTokensSchema.parse(req.body);
      
      // Check if contract exists in database
      const token = await this.prisma.token.findFirst({
        where: { contractAddress }
      });

      if (!token) {
        res.status(404).json({
          success: false,
          error: 'Token not found in database'
        });
        return;
      }

      const txHash = await this.smartContractService.mintTokens(contractAddress, recipient, amount);
      
      res.json({
        success: true,
        data: {
          txHash,
          tokenId: token.id,
          recipient,
          amount: amount.toString()
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Transfers tokens to a recipient
   * @param req Express request
   * @param res Express response
   */
  async transferTokens(req: Request, res: Response): Promise<void> {
    try {
      const { contractAddress, recipient, amount } = TransferTokensSchema.parse(req.body);
      
      // Check if contract exists in database
      const token = await this.prisma.token.findFirst({
        where: { contractAddress }
      });

      if (!token) {
        res.status(404).json({
          success: false,
          error: 'Token not found in database'
        });
        return;
      }

      const txHash = await this.smartContractService.transferTokens(contractAddress, recipient, amount);
      
      res.json({
        success: true,
        data: {
          txHash,
          tokenId: token.id,
          recipient,
          amount: amount.toString()
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets transaction receipt
   * @param req Express request
   * @param res Express response
   */
  async getTransactionReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { txHash } = TransactionHashSchema.parse(req.body);
      
      const receipt = await this.smartContractService.getTransactionReceipt(txHash);
      
      res.json({
        success: true,
        data: receipt
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets current gas price
   * @param req Express request
   * @param res Express response
   */
  async getGasPrice(req: Request, res: Response): Promise<void> {
    try {
      const gasPrice = await this.smartContractService.getGasPrice();
      
      res.json({
        success: true,
        data: { gasPrice }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets network configuration
   * @param req Express request
   * @param res Express response
   */
  async getNetworkConfig(req: Request, res: Response): Promise<void> {
    try {
      const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : DEFAULT_CHAIN_ID;
      const networkConfig = getNetworkConfig(chainId);
      
      if (!networkConfig) {
        res.status(404).json({
          success: false,
          error: `Network configuration not found for chain ID ${chainId}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: networkConfig
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}