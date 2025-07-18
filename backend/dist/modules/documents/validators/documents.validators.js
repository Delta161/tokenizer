import { z } from 'zod';
/**
 * Schema for validating document upload requests
 * Either propertyId or userId must be provided
 */
export const UploadDocumentSchema = z.object({
    propertyId: z.string().cuid().optional(),
    userId: z.string().uuid().optional(),
}).refine((data) => data.propertyId || data.userId, {
    message: 'Either propertyId or userId must be provided',
    path: ['propertyId', 'userId'],
});
/**
 * Schema for validating document retrieval requests
 */
export const GetDocumentSchema = z.object({
    id: z.string().cuid({
        message: 'Invalid document ID format',
    }),
});
/**
 * Schema for validating document deletion requests
 */
export const DeleteDocumentSchema = z.object({
    id: z.string().cuid({
        message: 'Invalid document ID format',
    }),
});
/**
 * Schema for validating document ID in URL parameters
 */
export const DocumentIdParamSchema = z.object({
    id: z.string().cuid({
        message: 'Invalid document ID format',
    }),
});
/**
 * Schema for validating document listing query parameters
 */
export const ListDocumentsQuerySchema = z.object({
    propertyId: z.string().cuid().optional(),
    userId: z.string().uuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    includeDeleted: z.coerce.boolean().default(false),
});
/**
 * Schema for validating property ID in URL parameters
 */
export const PropertyIdParamSchema = z.object({
    propertyId: z.string().cuid({
        message: 'Invalid property ID format',
    }),
});
/**
 * Schema for validating user ID in URL parameters
 */
export const UserIdParamSchema = z.object({
    userId: z.string().uuid({
        message: 'Invalid user ID format',
    }).optional(),
});
//# sourceMappingURL=documents.validators.js.map