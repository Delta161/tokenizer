import { z } from 'zod';
import { PAGINATION } from '@config/constants';

/**
 * Schema for validating document upload requests
 * Either propertyId or userId must be provided
 */
export const UploadDocumentSchema = z.object({
  propertyId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
}).refine(data => data.propertyId || data.userId, {
  message: 'Either propertyId or userId must be provided',
});

/**
 * Schema for validating document retrieval requests
 */
export const GetDocumentSchema = z.object({
  documentId: z.string().uuid(),
});

/**
 * Schema for validating document deletion requests
 */
export const DeleteDocumentSchema = z.object({
  documentId: z.string().uuid(),
});

/**
 * Schema for validating document ID path parameters
 */
export const DocumentIdParamSchema = z.object({
  documentId: z.string().uuid(),
});

/**
 * Schema for validating document listing query parameters
 */
export const ListDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_LIMIT),
  propertyId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

/**
 * Schema for validating property ID path parameters
 */
export const PropertyIdParamSchema = z.object({
  propertyId: z.string().uuid(),
});

/**
 * Schema for validating user ID path parameters
 */
export const UserIdParamSchema = z.object({
  userId: z.string().uuid(),
});