import { z } from 'zod';
/**
 * Client application validation schema
 */
export declare const clientApplicationSchema: z.ZodObject<{
    companyName: z.ZodString;
    contactEmail: z.ZodString;
    contactPhone: z.ZodString;
    country: z.ZodString;
    legalEntityNumber: z.ZodOptional<z.ZodString>;
    walletAddress: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Client update validation schema
 */
export declare const clientUpdateSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    legalEntityNumber: z.ZodOptional<z.ZodString>;
    walletAddress: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Client status update validation schema
 */
export declare const clientStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
/**
 * Client ID parameter validation schema
 */
export declare const clientIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Client list query validation schema
 */
export declare const clientListQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
}, z.core.$strip>;
/**
 * Validation helper functions
 */
export declare const validateClientApplication: (data: unknown) => z.ZodSafeParseResult<{
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    country: string;
    legalEntityNumber?: string | undefined;
    walletAddress?: string | undefined;
}>;
export declare const validateClientUpdate: (data: unknown) => z.ZodSafeParseResult<{
    companyName?: string | undefined;
    contactEmail?: string | undefined;
    contactPhone?: string | undefined;
    country?: string | undefined;
    legalEntityNumber?: string | undefined;
    walletAddress?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const validateClientStatusUpdate: (data: unknown) => z.ZodSafeParseResult<{
    status: "PENDING" | "APPROVED" | "REJECTED";
}>;
export declare const validateClientIdParam: (data: unknown) => z.ZodSafeParseResult<{
    id: string;
}>;
export declare const validateClientListQuery: (data: unknown) => z.ZodSafeParseResult<{
    limit: number;
    offset: number;
    status?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
}>;
//# sourceMappingURL=client.validators.d.ts.map