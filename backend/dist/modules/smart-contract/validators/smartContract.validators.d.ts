import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
/**
 * Schema for validating contract address
 */
export declare const ContractAddressSchema: z.ZodObject<{
    contractAddress: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating wallet address
 */
export declare const WalletAddressSchema: z.ZodObject<{
    walletAddress: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating token balance query
 */
export declare const BalanceQuerySchema: z.ZodObject<{
    contractAddress: z.ZodString;
    userWallet: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating token amount
 */
export declare const TokenAmountSchema: z.ZodObject<{
    amount: z.ZodPipe<z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodTransform<Decimal, string | number>>;
}, z.core.$strip>;
/**
 * Schema for validating mint tokens request
 */
export declare const MintTokensSchema: z.ZodObject<{
    contractAddress: z.ZodString;
    recipient: z.ZodString;
    amount: z.ZodPipe<z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodTransform<Decimal, string | number>>;
}, z.core.$strip>;
/**
 * Schema for validating transfer tokens request
 */
export declare const TransferTokensSchema: z.ZodObject<{
    contractAddress: z.ZodString;
    recipient: z.ZodString;
    amount: z.ZodPipe<z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodTransform<Decimal, string | number>>;
}, z.core.$strip>;
/**
 * Schema for validating transaction hash
 */
export declare const TransactionHashSchema: z.ZodObject<{
    txHash: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating network configuration
 */
export declare const NetworkConfigSchema: z.ZodObject<{
    chainId: z.ZodNumber;
    rpcUrl: z.ZodString;
    name: z.ZodString;
    blockExplorerUrl: z.ZodOptional<z.ZodString>;
    nativeCurrency: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=smartContract.validators.d.ts.map