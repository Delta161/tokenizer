/**
 * Smart Contract Service
 * Handles interactions with blockchain smart contracts
 */
import { ethers } from 'ethers';
import { TransactionStatus } from '../types/smartContract.types';
import { validateAddress, loadContractABI, resolveArtifactPath, validateTxHash } from '../utils/contract.utils';
import { logger } from '../utils/logger';
import { env } from '../config/env';
/**
 * Service for interacting with blockchain smart contracts
 */
export class SmartContractService {
    provider;
    wallet;
    config;
    eventListeners = [];
    constructor(config) {
        this.config = config;
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    }
    /**
     * Loads a contract instance
     * @param address The contract address
     * @returns A Contract instance
     */
    loadContract(address) {
        if (!validateAddress(address)) {
            throw new Error('Invalid contract address');
        }
        try {
            const artifactPath = resolveArtifactPath(this.config.artifactFileName);
            const abi = loadContractABI(artifactPath);
            return new ethers.Contract(address, abi, this.wallet);
        }
        catch (error) {
            throw new Error(`Failed to load contract: ${error.message}`);
        }
    }
    /**
     * Validates a contract to ensure it's a valid ERC20 token
     * @param address The contract address
     * @returns Validation result
     */
    async validateContract(address) {
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
        }
        catch (error) {
            logger.error('Contract validation error', { address, error: error.message });
            return {
                isValid: false,
                error: `Failed to validate contract: ${error.message}`
            };
        }
    }
    /**
     * Gets token metadata from a contract
     * @param address The contract address
     * @returns Token metadata
     */
    async getTokenMetadata(address) {
        if (!validateAddress(address)) {
            throw new Error('Invalid contract address');
        }
        try {
            const contract = this.loadContract(address);
            const [name, symbol, totalSupply, decimals, owner] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.totalSupply(),
                contract.decimals().catch(() => 18), // Default to 18 if not available
                contract.owner().catch(() => null) // Owner is optional
            ]);
            return {
                name,
                symbol,
                totalSupply: totalSupply.toString(),
                decimals,
                owner
            };
        }
        catch (error) {
            logger.error('Error getting token metadata', { address, error: error.message });
            throw new Error(`Failed to get token metadata: ${error.message}`);
        }
    }
    /**
     * Gets the balance of tokens for a wallet address
     * @param contractAddress The token contract address
     * @param walletAddress The wallet address to check
     * @returns The token balance
     */
    async getBalanceOf(contractAddress, walletAddress) {
        if (!validateAddress(contractAddress) || !validateAddress(walletAddress)) {
            throw new Error('Invalid address format');
        }
        try {
            const contract = this.loadContract(contractAddress);
            const balance = await contract.balanceOf(walletAddress);
            return balance.toString();
        }
        catch (error) {
            logger.error('Error getting token balance', { contractAddress, walletAddress, error: error.message });
            throw new Error(`Failed to get token balance: ${error.message}`);
        }
    }
    /**
     * Gets the current gas price from the network
     * @returns The current gas price in wei
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.provider.getFeeData();
            return gasPrice.gasPrice?.toString() || '0';
        }
        catch (error) {
            logger.error('Error getting gas price', { error: error.message });
            throw new Error(`Failed to get gas price: ${error.message}`);
        }
    }
    /**
     * Mints tokens to a recipient address
     * @param address The token contract address
     * @param recipient The recipient wallet address
     * @param amount The amount to mint
     * @returns Transaction hash
     */
    async mintTokens(address, recipient, amount) {
        if (!validateAddress(recipient)) {
            throw new Error('Invalid recipient address');
        }
        const contract = this.loadContract(address);
        const amountStr = amount.toString();
        try {
            const tx = await contract.mint(recipient, amountStr);
            await tx.wait();
            logger.info('Tokens minted', { address, recipient, amount: amountStr, txHash: tx.hash });
            return tx.hash;
        }
        catch (error) {
            logger.error('Error minting tokens', { address, recipient, amount: amountStr, error: error.message });
            throw new Error(`Failed to mint tokens: ${error.message}`);
        }
    }
    /**
     * Transfers tokens from the contract owner to a recipient
     * @param address The token contract address
     * @param recipient The recipient wallet address
     * @param amount The amount to transfer
     * @returns Transaction hash
     */
    async transferTokens(address, recipient, amount) {
        if (!validateAddress(recipient)) {
            throw new Error('Invalid recipient address');
        }
        const contract = this.loadContract(address);
        const amountStr = amount.toString();
        try {
            const tx = await contract.transfer(recipient, amountStr);
            await tx.wait();
            logger.info('Tokens transferred', { address, recipient, amount: amountStr, txHash: tx.hash });
            return tx.hash;
        }
        catch (error) {
            logger.error('Error transferring tokens', { address, recipient, amount: amountStr, error: error.message });
            throw new Error(`Failed to transfer tokens: ${error.message}`);
        }
    }
    /**
     * Gets a transaction receipt
     * @param txHash The transaction hash
     * @returns Transaction receipt
     */
    async getTransactionReceipt(txHash) {
        if (!validateTxHash(txHash)) {
            throw new Error('Invalid transaction hash format');
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
        }
        catch (error) {
            logger.error('Error getting transaction receipt', { txHash, error: error.message });
            throw new Error(`Failed to get transaction receipt: ${error.message}`);
        }
    }
    /**
     * Subscribes to contract events
     * @param address The contract address
     * @param eventName The event name to listen for
     * @param callback The callback function
     */
    subscribeToEvent(address, eventName, callback) {
        try {
            const contract = this.loadContract(address);
            contract.on(eventName, callback);
            this.eventListeners.push({
                contract,
                eventName,
                listener: callback
            });
            logger.info('Subscribed to contract event', { address, eventName });
        }
        catch (error) {
            logger.error('Error subscribing to event', { address, eventName, error: error.message });
            throw new Error(`Failed to subscribe to event: ${error.message}`);
        }
    }
    /**
     * Unsubscribes from all contract events
     */
    unsubscribeFromAllEvents() {
        for (const { contract, eventName, listener } of this.eventListeners) {
            contract.off(eventName, listener);
        }
        this.eventListeners = [];
        logger.info('Unsubscribed from all contract events');
    }
}
/**
 * Gets the smart contract configuration from environment variables
 * @returns Smart contract configuration
 */
export function getSmartContractConfig() {
    return {
        rpcUrl: env.ETH_RPC_URL,
        privateKey: env.CONTRACT_SIGNER_PRIVATE_KEY,
        artifactFileName: env.CONTRACT_ARTIFACT_FILE,
        chainId: env.ETH_CHAIN_ID ? parseInt(env.ETH_CHAIN_ID) : undefined,
        gasLimit: env.ETH_GAS_LIMIT ? parseInt(env.ETH_GAS_LIMIT) : undefined,
        gasPrice: env.ETH_GAS_PRICE || undefined,
    };
}
//# sourceMappingURL=smartContract.service.js.map