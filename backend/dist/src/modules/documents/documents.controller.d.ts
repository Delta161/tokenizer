import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { LocalStorageAdapter } from './storage.adapter.js';
export declare class DocumentController {
    private documentService;
    constructor(prisma?: PrismaClient, storageAdapter?: LocalStorageAdapter);
    /**
     * Upload a document
     * @param req - Express request
     * @param res - Express response
     */
    uploadDocument(req: Request, res: Response): Promise<void>;
    /**
     * Get a document by ID
     * @param req - Express request
     * @param res - Express response
     */
    getDocumentById(req: Request, res: Response): Promise<void>;
    /**
     * Delete a document
     * @param req - Express request
     * @param res - Express response
     */
    deleteDocument(req: Request, res: Response): Promise<void>;
    /**
     * Get documents by property ID
     * @param req - Express request
     * @param res - Express response
     */
    getDocumentsByPropertyId(req: Request, res: Response): Promise<void>;
    /**
     * Get documents by user ID
     * @param req - Express request
     * @param res - Express response
     */
    getDocumentsByUserId(req: Request, res: Response): Promise<void>;
    /**
     * List documents with pagination and filtering
     * @param req - Express request
     * @param res - Express response
     */
    listDocuments(req: Request, res: Response): Promise<void>;
    /**
     * Soft delete a document
     * @param req - Express request
     * @param res - Express response
     */
    softDeleteDocument(req: Request, res: Response): Promise<void>;
    /**
     * Restore a soft-deleted document
     * @param req - Express request
     * @param res - Express response
     */
    restoreDocument(req: Request, res: Response): Promise<void>;
    /**
     * Get document statistics
     * @param req - Express request
     * @param res - Express response
     */
    getStatistics(req: Request, res: Response): Promise<void>;
    /**
     * Download a document
     * @param req - Express request
     * @param res - Express response
     */
    downloadDocument(req: Request, res: Response): Promise<void>;
    /**
     * Preview a document
     * @param req - Express request
     * @param res - Express response
     */
    previewDocument(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=documents.controller.d.ts.map