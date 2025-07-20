/**
 * Smart Contract Types
 * Defines types used for blockchain interactions
 */
import { Decimal } from '@prisma/client/runtime/library';
import { Contract } from 'ethers';
export interface SmartContractConfig {
    rpcUrl: string;
    privateKey: string;
    artifactFileName: string;
    chainId?: number;
    gasLimit?: number;
    gasPrice?: string;
}
export interface TokenMetadata {
    name: string;
    symbol: string;
    totalSupply: string;
    decimals?: number;
    owner?: string;
}
export interface MintTokensDTO {
    contractAddress: string;
    recipient: string;
    amount: Decimal | string;
}
export interface TransferTokensDTO {
    contractAddress: string;
    recipient: string;
    amount: Decimal | string;
}
export interface BalanceOfDTO {
    contractAddress: string;
    userWallet: string;
}
export interface ContractEventListener {
    contract: Contract;
    eventName: string;
    listener: (...args: any[]) => void;
}
export interface TransactionResult {
    txHash: string;
    blockNumber?: number;
    gasUsed?: string;
    status?: boolean;
    events?: any[];
}
export interface ContractValidationResult {
    isValid: boolean;
    name?: string;
    symbol?: string;
    supportsERC20?: boolean;
    error?: string;
}
export interface NetworkConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorerUrl?: string;
    nativeCurrency?: {
        name: string;
        symbol: string;
        decimals: number;
    };
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED"
}
export interface TransactionReceipt {
    txHash: string;
    status: TransactionStatus;
    blockNumber?: number;
    gasUsed?: string;
    effectiveGasPrice?: string;
    from: string;
    to: string;
    contractAddress?: string;
    logs?: any[];
}
export interface SmartContractResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=smartContract.types.d.ts.map