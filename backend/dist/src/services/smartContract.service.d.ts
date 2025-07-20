/**
 * Smart Contract Service
 * Handles interactions with blockchain smart contracts
 */
import { Decimal } from '@prisma/client/runtime/library';
import { SmartContractConfig, TokenMetadata, ContractValidationResult, TransactionReceipt } from '../types/smartContract.types';
/**
 * Service for interacting with blockchain smart contracts
 */
export declare class SmartContractService {
    private provider;
    private wallet;
    private config;
    private eventListeners;
    constructor(config: SmartContractConfig);
    /**
     * Loads a contract instance
     * @param address The contract address
     * @returns A Contract instance
     */
    private loadContract;
    /**
     * Validates a contract to ensure it's a valid ERC20 token
     * @param address The contract address
     * @returns Validation result
     */
    validateContract(address: string): Promise<ContractValidationResult>;
    /**
     * Gets token metadata from a contract
     * @param address The contract address
     * @returns Token metadata
     */
    getTokenMetadata(address: string): Promise<TokenMetadata>;
    /**
     * Gets the balance of tokens for a wallet address
     * @param contractAddress The token contract address
     * @param walletAddress The wallet address to check
     * @returns The token balance
     */
    getBalanceOf(contractAddress: string, walletAddress: string): Promise<string>;
    /**
     * Gets the current gas price from the network
     * @returns The current gas price in wei
     */
    getGasPrice(): Promise<string>;
    /**
     * Mints tokens to a recipient address
     * @param address The token contract address
     * @param recipient The recipient wallet address
     * @param amount The amount to mint
     * @returns Transaction hash
     */
    mintTokens(address: string, recipient: string, amount: Decimal | string): Promise<string>;
    /**
     * Transfers tokens from the contract owner to a recipient
     * @param address The token contract address
     * @param recipient The recipient wallet address
     * @param amount The amount to transfer
     * @returns Transaction hash
     */
    transferTokens(address: string, recipient: string, amount: Decimal | string): Promise<string>;
    /**
     * Gets a transaction receipt
     * @param txHash The transaction hash
     * @returns Transaction receipt
     */
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt>;
    /**
     * Subscribes to contract events
     * @param address The contract address
     * @param eventName The event name to listen for
     * @param callback The callback function
     */
    subscribeToEvent(address: string, eventName: string, callback: (...args: any[]) => void): void;
    /**
     * Unsubscribes from all contract events
     */
    unsubscribeFromAllEvents(): void;
}
/**
 * Gets the smart contract configuration from environment variables
 * @returns Smart contract configuration
 */
export declare function getSmartContractConfig(): SmartContractConfig;
//# sourceMappingURL=smartContract.service.d.ts.map