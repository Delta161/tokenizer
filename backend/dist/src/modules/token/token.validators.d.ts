import { z } from 'zod';
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
    isTransferable: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const blockchainBalanceSchema: z.ZodObject<{
    contractAddress: z.ZodString;
    walletAddress: z.ZodString;
}, z.core.$strip>;
export declare const tokenIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const contractAddressParamsSchema: z.ZodObject<{
    contractAddress: z.ZodString;
}, z.core.$strip>;
export declare const tokenListQuerySchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodString>;
    symbol: z.ZodOptional<z.ZodString>;
    blockchain: z.ZodOptional<z.ZodEnum<{
        SEPOLIA: "SEPOLIA";
        POLYGON: "POLYGON";
        ETHEREUM: "ETHEREUM";
        MUMBAI: "MUMBAI";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
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
    isTransferable?: boolean | undefined;
}>;
export declare const safeParseBlockchainBalance: (data: unknown) => z.ZodSafeParseResult<{
    contractAddress: string;
    walletAddress: string;
}>;
export declare const safeParseTokenIdParams: (data: unknown) => z.ZodSafeParseResult<{
    id: string;
}>;
export declare const safeParseContractAddressParams: (data: unknown) => z.ZodSafeParseResult<{
    contractAddress: string;
}>;
export declare const safeParseTokenListQuery: (data: unknown) => z.ZodSafeParseResult<{
    propertyId?: string | undefined;
    symbol?: string | undefined;
    blockchain?: "SEPOLIA" | "POLYGON" | "ETHEREUM" | "MUMBAI" | undefined;
    isActive?: boolean | undefined;
}>;
//# sourceMappingURL=token.validators.d.ts.map