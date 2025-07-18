import { z } from 'zod';
export declare const tokenCreateSchema: z.ZodObject<{
    propertyId: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    totalSupply: z.ZodString;
    contractAddress: z.ZodString;
    chainId: z.ZodString;
}, z.core.$strip>;
export declare const tokenUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    symbol: z.ZodOptional<z.ZodString>;
    decimals: z.ZodOptional<z.ZodNumber>;
    totalSupply: z.ZodOptional<z.ZodString>;
    contractAddress: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=token.validators.d.ts.map