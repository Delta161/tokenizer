import { Decimal } from '@prisma/client/runtime/library';
import { SmartContractConfig, TokenMetadata, ContractValidationResult, TransactionReceipt } from './smartContract.types.js';
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
     * Validates if a contract address is valid and implements ERC20 interface
     * @param address The contract address to validate
     * @returns A validation result object
     */
    validateContract(address: string): Promise<ContractValidationResult>;
    /**
     * Gets metadata for a token contract
     * @param address The contract address
     * @returns Token metadata
     */
    getTokenMetadata(address: string): Promise<TokenMetadata>;
    /**
     * Gets the token balance for a wallet address
     * @param address The contract address
     * @param userWallet The wallet address to check balance for
     * @returns The token balance as a Decimal
     */
    getBalanceOf(address: string, userWallet: string): Promise<Decimal>;
    /**
     * Mints tokens to a recipient address
     * @param address The contract address
     * @param recipient The recipient address
     * @param amount The amount to mint
     * @returns Transaction hash
     */
    mintTokens(address: string, recipient: string, amount: Decimal | string): Promise<string>;
    /**
     * Transfers tokens to a recipient address
     * @param address The contract address
     * @param recipient The recipient address
     * @param amount The amount to transfer
     * @returns Transaction hash
     */
    transferTokens(address: string, recipient: string, amount: Decimal | string): Promise<string>;
    /**
     * Gets transaction details
     * @param txHash The transaction hash
     * @returns Transaction receipt details
     */
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt>;
    /**
     * Subscribes to contract events
     * @param address The contract address
     * @param eventName The event name to listen for
     * @param callback The callback function to execute when event is emitted
     * @returns A function to unsubscribe from the event
     */
    subscribeToEvent(address: string, eventName: string, callback: (...args: any[]) => void): () => void;
    /**
     * Unsubscribes from all events
     */
    unsubscribeFromAllEvents(): void;
    /**
     * Gets the current gas price
     * @returns The current gas price in gwei
     */
    getGasPrice(): Promise<string>;
    /**
     * Gets the current block number
     * @returns The current block number
     */
    getBlockNumber(): Promise<number>;
}
/**
 * Gets the smart contract configuration from environment variables
 * @returns SmartContractConfig object
 */
export declare function getSmartContractConfig(): SmartContractConfig;
//# sourceMappingURL=smartContract.service.d.ts.map