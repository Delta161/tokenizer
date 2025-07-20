/**
 * Property Validators
 * Defines validation schemas for property-related operations
 */
import { z } from 'zod';
/**
 * Create Property Schema
 * Validates property creation data
 */
export declare const createPropertySchema: z.ZodObject<{
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
}, z.core.$strict>;
/**
 * Update Property Schema
 * Validates property update data
 */
export declare const updatePropertySchema: z.ZodObject<{
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
}, z.core.$strict>;
/**
 * Update Property Status Schema
 * Validates property status update data
 */
export declare const updatePropertyStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
/**
 * Property ID Parameter Schema
 * Validates property ID in URL parameters
 */
export declare const propertyIdParamSchema: z.ZodObject<{
    propertyId: z.ZodString;
}, z.core.$strip>;
/**
 * Property Filter Schema
 * Validates property filter options
 */
export declare const propertyFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        title: "title";
        tokenPrice: "tokenPrice";
    }>>>;
    sortDirection: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
//# sourceMappingURL=property.validators.d.ts.map