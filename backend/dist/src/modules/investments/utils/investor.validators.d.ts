import { z } from 'zod';
/**
 * Validation schema for investor application
 */
export declare const investorApplicationSchema: z.ZodObject<{
    nationality: z.ZodString;
    dateOfBirth: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    institutionName: z.ZodOptional<z.ZodString>;
    vatNumber: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodString;
    postalCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validation schema for investor profile updates
 * At least one field must be provided
 */
export declare const investorUpdateSchema: z.ZodObject<{
    nationality: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    institutionName: z.ZodOptional<z.ZodString>;
    vatNumber: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validation schema for investor verification status updates
 */
export declare const investorVerificationUpdateSchema: z.ZodObject<{
    isVerified: z.ZodBoolean;
    verificationMethod: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validation schema for wallet creation
 */
export declare const walletCreateSchema: z.ZodObject<{
    address: z.ZodString;
    blockchain: z.ZodEnum<{
        SEPOLIA: "SEPOLIA";
        POLYGON: "POLYGON";
        MAINNET: "MAINNET";
    }>;
}, z.core.$strip>;
/**
 * Validation schema for wallet verification updates
 */
export declare const walletVerificationUpdateSchema: z.ZodObject<{
    isVerified: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Validation schema for investor ID path parameter
 */
export declare const investorIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Validation schema for wallet ID path parameter
 */
export declare const walletIdParamSchema: z.ZodObject<{
    walletId: z.ZodString;
}, z.core.$strip>;
/**
 * Validation schema for investor listing query parameters
 */
export declare const investorListQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    isVerified: z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean, "true" | "false" | undefined>>;
    country: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const parseInvestorApplication: (data: unknown) => z.ZodSafeParseResult<{
    nationality: string;
    dateOfBirth: Date | undefined;
    country: string;
    institutionName?: string | undefined;
    vatNumber?: string | undefined;
    phoneNumber?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
}>;
export declare const parseInvestorUpdate: (data: unknown) => z.ZodSafeParseResult<{
    dateOfBirth: Date | undefined;
    nationality?: string | undefined;
    institutionName?: string | undefined;
    vatNumber?: string | undefined;
    phoneNumber?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    country?: string | undefined;
    postalCode?: string | undefined;
}>;
export declare const parseInvestorVerificationUpdate: (data: unknown) => z.ZodSafeParseResult<{
    isVerified: boolean;
    verificationMethod?: string | undefined;
}>;
export declare const parseWalletCreate: (data: unknown) => z.ZodSafeParseResult<{
    address: string;
    blockchain: "SEPOLIA" | "POLYGON" | "MAINNET";
}>;
export declare const parseWalletVerificationUpdate: (data: unknown) => z.ZodSafeParseResult<{
    isVerified: boolean;
}>;
export declare const parseInvestorIdParam: (data: unknown) => z.ZodSafeParseResult<{
    id: string;
}>;
export declare const parseWalletIdParam: (data: unknown) => z.ZodSafeParseResult<{
    walletId: string;
}>;
export declare const parseInvestorListQuery: (data: unknown) => z.ZodSafeParseResult<{
    limit: number;
    offset: number;
    isVerified: boolean;
    country?: string | undefined;
}>;
//# sourceMappingURL=investor.validators.d.ts.map