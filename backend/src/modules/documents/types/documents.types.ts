import { Document, Property, User } from '@prisma/client';

/**
 * Data transfer object for returning document data
 */
export interface DocumentDto {
  id: string;
  propertyId: string | null;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
  previewUrl: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Data transfer object for uploading a document
 */
export interface UploadDocumentDto {
  propertyId?: string;
  userId?: string;
}

/**
 * Data transfer object for deleting a document
 */
export interface DeleteDocumentDto {
  documentId: string;
}

/**
 * Document with optional related entities
 */
export type DocumentWithRelations = Document & {
  property?: Property | null;
  user?: User | null;
};

/**
 * Data transfer object for paginated document responses
 */
export interface PaginatedDocumentsDto {
  data: DocumentDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Query parameters for listing documents
 */
export interface ListDocumentsQuery {
  page: number;
  limit: number;
  propertyId?: string;
  userId?: string;
  includeDeleted?: boolean;
}

/**
 * Data transfer object for document statistics
 */
export interface DocumentStatsDto {
  total: number;
  byProperty: Array<{
    propertyId: string;
    propertyTitle: string;
    count: number;
  }>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
}