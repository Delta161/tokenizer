import { Document, PrismaClient } from '@prisma/client';
import fs from 'fs';
import { DocumentStatsDto } from '../types/documents.types.js';
import { StorageAdapter } from '../utils/storage.adapter.js';
export declare class DocumentService {
    private prisma;
    private storageAdapter;
    constructor(prisma: PrismaClient, storageAdapter?: StorageAdapter);
    /**
     * Upload a document and save its metadata to the database
     * @param userId - The ID of the user uploading the document
     * @param propertyId - The ID of the property the document is associated with (optional)
     * @param file - The uploaded file metadata from multer
     * @returns The created document record
     */
    uploadDocument(userId: string, propertyId: string | null, file: Express.Multer.File): Promise<Document>;
    /**
     * Get a document by its ID
     * @param documentId - The ID of the document to retrieve
     * @param userId - The ID of the user requesting the document
     * @returns The document record if found and accessible
     */
    getDocumentById(documentId: string, userId: string): Promise<Document>;
    /**
     * Delete a document by its ID
     * @param documentId - The ID of the document to delete
     * @param userId - The ID of the user requesting deletion
     * @returns The deleted document record
     */
    deleteDocument(documentId: string, userId: string): Promise<Document>;
    /**
     * Get documents by property ID
     * @param propertyId - The ID of the property
     * @param userId - The ID of the user requesting the documents
     * @returns Array of document records
     */
    getDocumentsByPropertyId(propertyId: string, userId: string): Promise<Document[]>;
    /**
     * Get documents by user ID
     * @param targetUserId - The ID of the user whose documents to retrieve
     * @param requestingUserId - The ID of the user making the request
     * @returns Array of document records
     */
    getDocumentsByUserId(targetUserId: string, requestingUserId: string): Promise<Document[]>;
    /**
     * List documents with pagination and filtering
     * @param filters - Filters to apply (propertyId, userId)
     * @param page - Page number (1-indexed)
     * @param limit - Number of items per page
     * @param requestingUserId - ID of the user making the request
     * @param includeDeleted - Whether to include soft-deleted documents
     * @returns Object containing documents and pagination info
     */
    listDocuments(filters: {
        propertyId?: string;
        userId?: string;
    }, page: number, limit: number, requestingUserId: string, includeDeleted?: boolean): Promise<{
        documents: Document[];
        total: number;
    }>;
    /**
     * Download a document
     * @param id - Document ID
     * @param userId - ID of the user making the request
     * @returns Document record and readable stream
     */
    downloadDocument(id: string, userId: string): Promise<{
        document: Document;
        stream: fs.ReadStream;
    }>;
    /**
     * Preview a document
     * @param id - Document ID
     * @param userId - ID of the user making the request
     * @returns Document record and readable stream
     */
    previewDocument(id: string, userId: string): Promise<{
        document: Document;
        stream: fs.ReadStream;
    }>;
    /**
     * Soft delete a document
     * @param id - Document ID
     * @param userId - ID of the user making the request
     * @returns Updated document record
     */
    softDeleteDocument(id: string, userId: string): Promise<Document>;
    /**
     * Restore a soft-deleted document
     * @param id - Document ID
     * @param userId - ID of the user making the request
     * @returns Updated document record
     */
    restoreDocument(id: string, userId: string): Promise<Document>;
    /**
     * Get document statistics
     * @param userId - ID of the user making the request (must be admin)
     * @returns Document statistics
     */
    getStatistics(userId: string): Promise<DocumentStatsDto>;
}
//# sourceMappingURL=documents.service.d.ts.map