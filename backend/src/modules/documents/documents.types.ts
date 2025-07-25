import { Document } from '@prisma/client';

/**
 * Data Transfer Object for Document
 * Used for returning document data to clients
 */
export interface DocumentDto {
  id: string;
  propertyId: string | null;
  userId: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
  createdAt: Date;
}

/**
 * Data Transfer Object for uploading a document
 */
export interface UploadDocumentDto {
  propertyId?: string;
  userId?: string;
  file: Express.Multer.File;
}

/**
 * Data Transfer Object for deleting a document
 */
export interface DeleteDocumentDto {
  id: string;
}

/**
 * Document with optional related entities
 */
export interface DocumentWithRelations extends Document {
  property?: {
    id: string;
    title: string;
    clientId: string;
  } | null;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  } | null;
}

/**
 * Paginated response for document listings
 */
export interface PaginatedDocumentsDto {
  success: boolean;
  data: DocumentDto[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
  message?: string;
}

/**
 * Query parameters for listing documents
 */
export interface ListDocumentsQuery {
  propertyId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

/**
 * Document statistics response
 */
export interface DocumentStatsDto {
  total: number;
  byProperty: {
    propertyId: string;
    propertyTitle: string;
    count: number;
  }[];
  byUser: {
    userId: string;
    userName: string;
    count: number;
  }[];
}