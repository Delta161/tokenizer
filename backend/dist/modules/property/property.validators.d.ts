import { z } from 'zod';
export declare const propertyCreateSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    country: z.ZodString;
    city: z.ZodString;
    address: z.ZodString;
    imageUrls: z.ZodArray<z.ZodString>;
    totalPrice: z.ZodString;
    tokenPrice: z.ZodString;
    irr: z.ZodString;
    apr: z.ZodString;
    valueGrowth: z.ZodString;
    minInvestment: z.ZodString;
    tokensAvailablePercent: z.ZodString;
    tokenSymbol: z.ZodString;
}, z.core.$strip>;
export declare const propertyUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    imageUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    totalPrice: z.ZodOptional<z.ZodString>;
    tokenPrice: z.ZodOptional<z.ZodString>;
    irr: z.ZodOptional<z.ZodString>;
    apr: z.ZodOptional<z.ZodString>;
    valueGrowth: z.ZodOptional<z.ZodString>;
    minInvestment: z.ZodOptional<z.ZodString>;
    tokensAvailablePercent: z.ZodOptional<z.ZodString>;
    tokenSymbol: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const propertyStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=property.validators.d.ts.map