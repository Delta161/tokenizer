import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DocumentService } from './documents.service.js';
import { UploadDocumentSchema, GetDocumentSchema, DeleteDocumentSchema, ListDocumentsQuerySchema } from './documents.validators.js';
import { mapDocumentToDto, mapToPaginatedDocumentsDto } from './documents.mapper.js';
import { LocalStorageAdapter } from './storage.adapter.js';
import { getFilePath } from './upload.middleware.js';
import { logger } from '@utils/logger';

export class DocumentController {
  private documentService: DocumentService;

  constructor(prisma?: PrismaClient, storageAdapter?: LocalStorageAdapter) {
    this.documentService = new DocumentService(prisma, storageAdapter);
  }

  /**
   * Upload a document
   * @param req - Express request
   * @param res - Express response
   */
  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate request body
      const validationResult = UploadDocumentSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid request data', errors: validationResult.error.format() });
        return;
      }

      // Ensure file was uploaded
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // Extract data from validated request
      const { propertyId } = validationResult.data;

      // Upload document
      const document = await this.documentService.uploadDocument(
        req.user.id,
        propertyId,
        req.file
      );

      // Return document DTO
      res.status(201).json(mapDocumentToDto(document, req));
    } catch (error) {
      logger.error('Error uploading document', { module: 'documents', method: 'uploadDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred while uploading the document' });
    }
  }

  /**
   * Get a document by ID
   * @param req - Express request
   * @param res - Express response
   */
  async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate document ID
      const validationResult = GetDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid document ID', errors: validationResult.error.format() });
        return;
      }

      // Get document
      const document = await this.documentService.getDocumentById(
        validationResult.data.id,
        req.user.id
      );

      // Return document DTO
      res.status(200).json(mapDocumentToDto(document, req));
    } catch (error) {
      logger.error('Error getting document', { module: 'documents', method: 'getDocumentById' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while retrieving the document',
      });
    }
  }

  /**
   * Delete a document
   * @param req - Express request
   * @param res - Express response
   */
  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate document ID
      const validationResult = DeleteDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid document ID', errors: validationResult.error.format() });
        return;
      }

      // Delete document
      await this.documentService.deleteDocument(
        validationResult.data.id,
        req.user.id
      );

      // Return success response
      res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      logger.error('Error deleting document', { module: 'documents', method: 'deleteDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while deleting the document',
      });
    }
  }

  /**
   * Get documents by property ID
   * @param req - Express request
   * @param res - Express response
   */
  async getDocumentsByPropertyId(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const propertyId = req.params.propertyId;
      if (!propertyId) {
        res.status(400).json({ message: 'Property ID is required' });
        return;
      }

      // Get documents
      const documents = await this.documentService.getDocumentsByPropertyId(
        propertyId,
        req.user.id
      );

      // Return document DTOs
      res.status(200).json(documents.map(doc => mapDocumentToDto(doc, req)));
    } catch (error) {
      logger.error('Error getting documents by property', { module: 'documents', method: 'getDocumentsByPropertyId' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while retrieving documents',
      });
    }
  }

  /**
   * Get documents by user ID
   * @param req - Express request
   * @param res - Express response
   */
  async getDocumentsByUserId(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const targetUserId = req.params.userId || req.user.id;

      // Get documents
      const documents = await this.documentService.getDocumentsByUserId(
        req.user.id,
        targetUserId
      );

      // Return document DTOs
      res.status(200).json(documents.map(doc => mapDocumentToDto(doc, req)));
    } catch (error) {
      logger.error('Error getting documents by user', { module: 'documents', method: 'getDocumentsByUserId' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while retrieving documents',
      });
    }
  }

  /**
   * List documents with pagination and filtering
   * @param req - Express request
   * @param res - Express response
   */
  async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate query parameters
      const validationResult = ListDocumentsQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid query parameters', errors: validationResult.error.format() });
        return;
      }

      // Get documents
      const { documents, total } = await this.documentService.listDocuments(
        req.user.id,
        validationResult.data
      );

      // Return paginated document DTOs
      res.status(200).json(
        mapToPaginatedDocumentsDto(
          documents.map(doc => mapDocumentToDto(doc, req)),
          total,
          validationResult.data.page || 1,
          validationResult.data.limit || 10
        )
      );
    } catch (error) {
      logger.error('Error listing documents', { module: 'documents', method: 'listDocuments' }, error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        message: error instanceof Error ? error.message : 'An error occurred while listing documents',
      });
    }
  }

  /**
   * Soft delete a document
   * @param req - Express request
   * @param res - Express response
   */
  async softDeleteDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate document ID
      const validationResult = DeleteDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid document ID', errors: validationResult.error.format() });
        return;
      }

      // Soft delete document
      await this.documentService.softDeleteDocument(
        validationResult.data.id,
        req.user.id
      );

      // Return success response
      res.status(200).json({ message: 'Document marked as deleted successfully' });
    } catch (error) {
      logger.error('Error soft deleting document', { module: 'documents', method: 'softDeleteDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while marking the document as deleted',
      });
    }
  }

  /**
   * Restore a soft-deleted document
   * @param req - Express request
   * @param res - Express response
   */
  async restoreDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate document ID
      const validationResult = DeleteDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid document ID', errors: validationResult.error.format() });
        return;
      }

      // Restore document
      await this.documentService.restoreDocument(
        validationResult.data.id,
        req.user.id
      );

      // Return success response
      res.status(200).json({ message: 'Document restored successfully' });
    } catch (error) {
      logger.error('Error restoring document', { module: 'documents', method: 'restoreDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while restoring the document',
      });
    }
  }

  /**
   * Get document statistics
   * @param req - Express request
   * @param res - Express response
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Get statistics
      const stats = await this.documentService.getStatistics(req.user.id);

      // Return statistics
      res.status(200).json(stats);
    } catch (error) {
      logger.error('Error getting document statistics', { module: 'documents', method: 'getStatistics' }, error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        message: error instanceof Error ? error.message : 'An error occurred while retrieving document statistics',
      });
    }
  }

  /**
   * Download a document
   * @param req - Express request
   * @param res - Express response
   */
  async downloadDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate document ID
      const validationResult = GetDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid document ID', errors: validationResult.error.format() });
        return;
      }

      // Get document and stream
      const { document, stream } = await this.documentService.downloadDocument(
        validationResult.data.id,
        req.user.id
      );

      // Set response headers
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.setHeader('Content-Length', document.size.toString());

      // Stream file to response
      stream.pipe(res);
    } catch (error) {
      logger.error('Error downloading document', { module: 'documents', method: 'downloadDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while downloading the document',
      });
    }
  }

  /**
   * Preview a document
   * @param req - Express request
   * @param res - Express response
   */
  async previewDocument(req: Request, res: Response): Promise<void> {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Validate document ID
      const validationResult = GetDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({ message: 'Invalid document ID', errors: validationResult.error.format() });
        return;
      }

      // Get document and stream
      const { document, stream } = await this.documentService.downloadDocument(
        validationResult.data.id,
        req.user.id
      );

      // Set response headers for inline display
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
      res.setHeader('Content-Length', document.size.toString());

      // Stream file to response
      stream.pipe(res);
    } catch (error) {
      logger.error('Error previewing document', { module: 'documents', method: 'previewDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('not found') ? 404 : 500).json({
        message: error instanceof Error ? error.message : 'An error occurred while previewing the document',
      });
    }
  }
}