import { z } from 'zod';
/**
 * Schema for validating document upload requests
 * Either propertyId or userId must be provided
 */
export declare const UploadDocumentSchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Schema for validating document retrieval requests
 */
export declare const GetDocumentSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating document deletion requests
 */
export declare const DeleteDocumentSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating document ID in URL parameters
 */
export declare const DocumentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating document listing query parameters
 */
export declare const ListDocumentsQuerySchema: z.ZodObject<{
    propertyId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    includeDeleted: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
/**
 * Schema for validating property ID in URL parameters
 */
export declare const PropertyIdParamSchema: z.ZodObject<{
    propertyId: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating user ID in URL parameters
 */
export declare const UserIdParamSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=documents.validators.d.ts.map