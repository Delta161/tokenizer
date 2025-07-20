import { z } from 'zod';
export declare const investmentCreateSchema: z.ZodObject<{
    tokenId: z.ZodString;
    propertyId: z.ZodString;
    amount: z.ZodString;
    tokensBought: z.ZodString;
    walletAddress: z.ZodString;
    paymentMethod: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        FIAT: "FIAT";
        CRYPTO: "CRYPTO";
    }>>>;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const investmentUpdateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        FAILED: "FAILED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>;
    txHash: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const parseInvestmentCreate: (data: unknown) => z.ZodSafeParseResult<{
    tokenId: string;
    propertyId: string;
    amount: string;
    tokensBought: string;
    walletAddress: string;
    paymentMethod: "FIAT" | "CRYPTO";
    currency: string;
}>;
export declare const parseInvestmentUpdateStatus: (data: unknown) => z.ZodSafeParseResult<{
    status: "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED" | "REFUNDED";
    txHash?: string | undefined;
}>;
//# sourceMappingURL=investment.validators.d.ts.map