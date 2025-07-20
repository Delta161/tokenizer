/**
 * Token Validators
 * Defines validation schemas for token-related operations
 */
import { z } from 'zod';
/**
 * Token creation schema
 * Validates data for creating a new token
 */
export declare const tokenCreateSchema: z.ZodObject<{
    propertyId: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    totalSupply: z.ZodString;
    contractAddress: z.ZodString;
    blockchain: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        SEPOLIA: "SEPOLIA";
        POLYGON: "POLYGON";
        ETHEREUM: "ETHEREUM";
        MUMBAI: "MUMBAI";
    }>>>;
}, z.core.$strip>;
/**
 * Token update schema
 * Validates data for updating an existing token
 */
export declare const tokenUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    symbol: z.ZodOptional<z.ZodString>;
    decimals: z.ZodOptional<z.ZodNumber>;
    totalSupply: z.ZodOptional<z.ZodString>;
    contractAddress: z.ZodOptional<z.ZodString>;
    blockchain: z.ZodOptional<z.ZodEnum<{
        SEPOLIA: "SEPOLIA";
        POLYGON: "POLYGON";
        ETHEREUM: "ETHEREUM";
        MUMBAI: "MUMBAI";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Token list query schema
 * Validates query parameters for listing tokens
 */
export declare const tokenListQuerySchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodString>;
    symbol: z.ZodOptional<z.ZodString>;
    blockchain: z.ZodOptional<z.ZodEnum<{
        SEPOLIA: "SEPOLIA";
        POLYGON: "POLYGON";
        ETHEREUM: "ETHEREUM";
        MUMBAI: "MUMBAI";
    }>>;
    isActive: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
/**
 * Token ID parameter schema
 * Validates token ID in route parameters
 */
export declare const tokenIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Contract address parameter schema
 * Validates contract address in route parameters
 */
export declare const contractAddressParamsSchema: z.ZodObject<{
    contractAddress: z.ZodString;
}, z.core.$strip>;
/**
 * Wallet address parameter schema
 * Validates wallet address in route parameters
 */
export declare const walletAddressParamsSchema: z.ZodObject<{
    walletAddress: z.ZodString;
}, z.core.$strip>;
/**
 * Blockchain balance query schema
 * Validates parameters for getting token balance from blockchain
 */
export declare const blockchainBalanceSchema: z.ZodObject<{
    contractAddress: z.ZodString;
    walletAddress: z.ZodString;
}, z.core.$strip>;
export declare const safeParseTokenCreate: (data: unknown) => z.ZodSafeParseResult<{
    propertyId: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    contractAddress: string;
    blockchain: "SEPOLIA" | "POLYGON" | "ETHEREUM" | "MUMBAI";
}>;
export declare const safeParseTokenUpdate: (data: unknown) => z.ZodSafeParseResult<{
    name?: string | undefined;
    symbol?: string | undefined;
    decimals?: number | undefined;
    totalSupply?: string | undefined;
    contractAddress?: string | undefined;
    blockchain?: "SEPOLIA" | "POLYGON" | "ETHEREUM" | "MUMBAI" | undefined;
    isActive?: boolean | undefined;
}>;
export declare const safeParseTokenListQuery: (data: unknown) => z.ZodSafeParseResult<{
    page: number;
    limit: number;
    propertyId?: string | undefined;
    symbol?: string | undefined;
    blockchain?: "SEPOLIA" | "POLYGON" | "ETHEREUM" | "MUMBAI" | undefined;
    isActive?: boolean | undefined;
}>;
export declare const safeParseTokenIdParams: (data: unknown) => z.ZodSafeParseResult<{
    id: string;
}>;
export declare const safeParseContractAddressParams: (data: unknown) => z.ZodSafeParseResult<{
    contractAddress: string;
}>;
export declare const safeParseWalletAddressParams: (data: unknown) => z.ZodSafeParseResult<{
    walletAddress: string;
}>;
export declare const safeParseBlockchainBalance: (data: unknown) => z.ZodSafeParseResult<{
    contractAddress: string;
    walletAddress: string;
}>;
//# sourceMappingURL=token.validators.d.ts.map