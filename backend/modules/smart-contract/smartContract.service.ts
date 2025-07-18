import { ethers, Contract, Wallet, JsonRpcProvider, ContractTransactionResponse } from 'ethers';
import { Decimal } from '@prisma/client/runtime/library';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  SmartContractConfig,
  TokenMetadata,
  TransactionResult,
  ContractValidationResult,
  TransactionStatus,
  TransactionReceipt,
  ContractEventListener
} from './types/smartContract.types.js';
import {
  validateAddress,
  loadContractABI,
  resolveArtifactPath,
  validateTxHash,
  formatTokenAmount,
  parseTokenAmount
} from './utils/contract.utils.js';

dotenv.config();

export class SmartContractService {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private config: SmartContractConfig;
  private eventListeners: ContractEventListener[] = [];

  constructor(config: SmartContractConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
  }

  /**
   * Loads a contract instance
   * @param address The contract address
   * @returns A Contract instance
   */
  private loadContract(address: string): Contract {
    if (!validateAddress(address)) {
      throw new Error('Invalid contract address');
    }
    
    try {
      const artifactPath = resolveArtifactPath(this.config.artifactFileName);
      const abi = loadContractABI(artifactPath);
      return new ethers.Contract(address, abi, this.wallet);
    } catch (error: any) {
      throw new Error(`Failed to load contract: ${error.message}`);
    }
  }

  /**
   * Validates if a contract address is valid and implements ERC20 interface
   * @param address The contract address to validate
   * @returns A validation result object
   */
  async validateContract(address: string): Promise<ContractValidationResult> {
    if (!validateAddress(address)) {
      return { isValid: false, error: 'Invalid Ethereum address format' };
    }

    try {
      const contract = this.loadContract(address);
      
      // Check if contract implements ERC20 interface
      const [name, symbol, totalSupply, decimals] = await Promise.all([
        contract.name().catch(() => null),
        contract.symbol().catch(() => null),
        contract.totalSupply().catch(() => null),
        contract.decimals().catch(() => null)
      ]);

      const supportsERC20 = name !== null && symbol !== null && totalSupply !== null;

      return {
        isValid: supportsERC20,
        name: name,
        symbol: symbol,
        supportsERC20,
        error: supportsERC20 ? undefined : 'Contract does not implement ERC20 interface'
      };
    } catch (error: any) {
      return { isValid: false, error: `Contract validation failed: ${error.message}` };
    }
  }

  /**
   * Gets metadata for a token contract
   * @param address The contract address
   * @returns Token metadata
   */
  async getTokenMetadata(address: string): Promise<TokenMetadata> {
    const contract = this.loadContract(address);
    
    try {
      const [name, symbol, totalSupply, decimals, owner] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.decimals().catch(() => 18), // Default to 18 if not available
        contract.owner().catch(() => null)  // Owner is optional
      ]);

      return {
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        decimals,
        owner
      };
    } catch (error: any) {
      throw new Error(`Failed to get token metadata: ${error.message}`);
    }
  }

  /**
   * Gets the token balance for a wallet address
   * @param address The contract address
   * @param userWallet The wallet address to check balance for
   * @returns The token balance as a Decimal
   */
  async getBalanceOf(address: string, userWallet: string): Promise<Decimal> {
    if (!validateAddress(userWallet)) {
      throw new Error('Invalid user wallet address');
    }
    
    const contract = this.loadContract(address);
    
    try {
      const balance = await contract.balanceOf(userWallet);
      return new Decimal(balance.toString());
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Mints tokens to a recipient address
   * @param address The contract address
   * @param recipient The recipient address
   * @param amount The amount to mint
   * @returns Transaction hash
   */
  async mintTokens(address: string, recipient: string, amount: Decimal | string): Promise<string> {
    if (!validateAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }
    
    const contract = this.loadContract(address);
    const amountStr = amount.toString();
    
    try {
      // Get decimals to format amount correctly
      const decimals = await contract.decimals().catch(() => 18);
      const formattedAmount = formatTokenAmount(amountStr, decimals);
      
      const tx = await contract.mint(recipient, formattedAmount, {
        gasLimit: this.config.gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Minting failed: ${error.message}`);
    }
  }

  /**
   * Transfers tokens to a recipient address
   * @param address The contract address
   * @param recipient The recipient address
   * @param amount The amount to transfer
   * @returns Transaction hash
   */
  async transferTokens(address: string, recipient: string, amount: Decimal | string): Promise<string> {
    if (!validateAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }
    
    const contract = this.loadContract(address);
    const amountStr = amount.toString();
    
    try {
      // Get decimals to format amount correctly
      const decimals = await contract.decimals().catch(() => 18);
      const formattedAmount = formatTokenAmount(amountStr, decimals);
      
      const tx = await contract.transfer(recipient, formattedAmount, {
        gasLimit: this.config.gasLimit,
        gasPrice: this.config.gasPrice ? ethers.parseUnits(this.config.gasPrice, 'gwei') : undefined
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Gets transaction details
   * @param txHash The transaction hash
   * @returns Transaction receipt details
   */
  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    if (!validateTxHash(txHash)) {
      throw new Error('Invalid transaction hash');
    }
    
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          txHash,
          status: TransactionStatus.PENDING,
          from: '',
          to: ''
        };
      }
      
      return {
        txHash,
        status: receipt.status ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice.toString(),
        from: receipt.from,
        to: receipt.to || '',
        contractAddress: receipt.contractAddress || undefined,
        logs: receipt.logs
      };
    } catch (error: any) {
      throw new Error(`Failed to get transaction receipt: ${error.message}`);
    }
  }

  /**
   * Subscribes to contract events
   * @param address The contract address
   * @param eventName The event name to listen for
   * @param callback The callback function to execute when event is emitted
   * @returns A function to unsubscribe from the event
   */
  subscribeToEvent(address: string, eventName: string, callback: (...args: any[]) => void): () => void {
    const contract = this.loadContract(address);
    
    contract.on(eventName, callback);
    
    const eventListener: ContractEventListener = {
      contract,
      eventName,
      listener: callback
    };
    
    this.eventListeners.push(eventListener);
    
    return () => {
      contract.off(eventName, callback);
      this.eventListeners = this.eventListeners.filter(l => 
        l.contract !== contract || l.eventName !== eventName || l.listener !== callback
      );
    };
  }

  /**
   * Unsubscribes from all events
   */
  unsubscribeFromAllEvents(): void {
    for (const { contract, eventName, listener } of this.eventListeners) {
      contract.off(eventName, listener);
    }
    this.eventListeners = [];
  }

  /**
   * Gets the current gas price
   * @returns The current gas price in gwei
   */
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getFeeData();
    return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
  }

  /**
   * Gets the current block number
   * @returns The current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }
}

/**
 * Gets the smart contract configuration from environment variables
 * @returns SmartContractConfig object
 */
export function getSmartContractConfig(): SmartContractConfig {
  return {
    rpcUrl: process.env.ETH_RPC_URL || 'http://localhost:8545',
    privateKey: process.env.CONTRACT_SIGNER_PRIVATE_KEY || '',
    artifactFileName: process.env.CONTRACT_ARTIFACT_FILE || 'Token.json',
    chainId: process.env.ETH_CHAIN_ID ? parseInt(process.env.ETH_CHAIN_ID) : undefined,
    gasLimit: process.env.ETH_GAS_LIMIT ? parseInt(process.env.ETH_GAS_LIMIT) : undefined,
    gasPrice: process.env.ETH_GAS_PRICE || undefined,
  };
}