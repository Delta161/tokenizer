import { Document, PrismaClient } from '@prisma/client';
import { Readable } from 'stream';
import { DocumentStatsDto } from './documents.types.js';
import { StorageAdapter } from './storage.adapter.js';
export declare class DocumentService {
    private prisma;
    private storageAdapter;
    constructor(prisma?: PrismaClient, storageAdapter?: StorageAdapter);
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
     * @param requestingUserId - The ID of the user making the request
     * @param targetUserId - The ID of the user whose documents to retrieve (optional, defaults to requesting user)
     * @returns Array of document records
     */
    getDocumentsByUserId(requestingUserId: string, targetUserId?: string): Promise<Document[]>;
    /**
     * List documents with pagination and filtering
     * @param userId - The ID of the user making the request
     * @param filter - Filter criteria for documents
     * @returns Array of document records and total count
     */
    listDocuments(userId: string, filter: {
        propertyId?: string;
        userId?: string;
        page?: number;
        limit?: number;
        includeDeleted?: boolean;
    }): Promise<{
        documents: Document[];
        total: number;
    }>;
    /**
     * Soft delete a document by marking it as deleted
     * @param documentId - The ID of the document to soft delete
     * @param userId - The ID of the user requesting deletion
     * @returns The updated document record
     */
    softDeleteDocument(documentId: string, userId: string): Promise<Document>;
    /**
     * Restore a soft-deleted document
     * @param documentId - The ID of the document to restore
     * @param userId - The ID of the user requesting restoration
     * @returns The updated document record
     */
    restoreDocument(documentId: string, userId: string): Promise<Document>;
    /**
     * Get document statistics
     * @param userId - The ID of the user requesting statistics
     * @returns Document statistics
     */
    getStatistics(userId: string): Promise<DocumentStatsDto>;
    /**
     * Download a document
     * @param documentId - The ID of the document to download
     * @param userId - The ID of the user requesting the download
     * @returns The document record and a readable stream of the file
     */
    downloadDocument(documentId: string, userId: string): Promise<{
        document: Document;
        stream: Readable;
    }>;
}
//# sourceMappingURL=documents.service.d.ts.map