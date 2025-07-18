import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/types/auth.types.js';
import { DocumentService } from '../services/documents.service.js';
export declare class DocumentController {
    private documentService;
    constructor(documentService: DocumentService);
    /**
     * Upload a document
     * @param req - The request object
     * @param res - The response object
     */
    uploadDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get a document by ID
     * @param req - The request object
     * @param res - The response object
     */
    getDocumentById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Delete a document
     * @param req - The request object
     * @param res - The response object
     */
    deleteDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get documents by property ID
     * @param req - The request object
     * @param res - The response object
     */
    getDocumentsByPropertyId: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get documents by user ID
     * @param req - The request object
     * @param res - The response object
     */
    getDocumentsByUserId: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * List documents with pagination and filtering
     * @param req - The request object
     * @param res - The response object
     */
    listDocuments: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Download a document
     * @param req - The request object
     * @param res - The response object
     */
    downloadDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Preview a document
     * @param req - The request object
     * @param res - The response object
     */
    previewDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Soft delete a document
     * @param req - The request object
     * @param res - The response object
     */
    softDeleteDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Restore a soft-deleted document
     * @param req - The request object
     * @param res - The response object
     */
    restoreDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * Get document statistics
     * @param req - The request object
     * @param res - The response object
     */
    getStatistics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=documents.controller.d.ts.map