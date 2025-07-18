import { Response } from 'express';
import { AuthenticatedRequest } from '../../auth/types/auth.types.js';
import { DocumentService } from '../services/documents.service.js';
import { mapDocumentToDto, mapDocumentsToDto, mapToPaginatedDocumentsDto } from '../utils/documents.mapper.js';
import { 
  UploadDocumentSchema, 
  GetDocumentSchema, 
  DeleteDocumentSchema,
  ListDocumentsQuerySchema,
  DocumentIdParamSchema
} from '../validators/documents.validators.js';
import { getFilePath } from '../middleware/upload.middleware.js';
import logger from '../../../utils/logger.js';
import fs from 'fs';

export class DocumentController {
  private documentService: DocumentService;

  constructor(documentService: DocumentService) {
    this.documentService = documentService;
  }

  /**
   * Upload a document
   * @param req - The request object
   * @param res - The response object
   */
  uploadDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Ensure file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      // Validate request body
      const validationResult = UploadDocumentSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.format(),
        });
        return;
      }

      // Extract propertyId from validated body
      const { propertyId } = validationResult.data;

      // Upload document
      const document = await this.documentService.uploadDocument(
        req.user.id,
        propertyId || null,
        req.file
      );

      // Return success response with document DTO
      res.status(201).json({
        success: true,
        data: mapDocumentToDto(document, `${req.protocol}://${req.get('host')}`),
      });
    } catch (error) {
      logger.error('Error uploading document', { module: 'documents', method: 'uploadDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Get a document by ID
   * @param req - The request object
   * @param res - The response object
   */
  getDocumentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Validate document ID
      const validationResult = GetDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid document ID',
          details: validationResult.error.format(),
        });
        return;
      }

      // Get document
      const document = await this.documentService.getDocumentById(
        validationResult.data.id,
        req.user.id
      );

      // Check if download parameter is present
      const download = req.query.download === 'true';

      if (download) {
        // Stream the file for download
        const filePath = getFilePath(document.filename);
        const fileName = document.originalName;

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          res.status(404).json({
            success: false,
            error: 'File not found on server',
          });
          return;
        }

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', document.mimeType);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        // Return document metadata
        res.status(200).json({
          success: true,
          data: mapDocumentToDto(document, `${req.protocol}://${req.get('host')}`),
        });
      }
    } catch (error) {
      logger.error('Error retrieving document', { module: 'documents', method: 'getDocumentById' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Delete a document
   * @param req - The request object
   * @param res - The response object
   */
  deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Validate document ID
      const validationResult = DeleteDocumentSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid document ID',
          details: validationResult.error.format(),
        });
        return;
      }

      // Delete document
      await this.documentService.deleteDocument(
        validationResult.data.id,
        req.user.id
      );

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting document', { module: 'documents', method: 'deleteDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Get documents by property ID
   * @param req - The request object
   * @param res - The response object
   */
  getDocumentsByPropertyId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const propertyId = req.params.propertyId;
      if (!propertyId) {
        res.status(400).json({
          success: false,
          error: 'Property ID is required',
        });
        return;
      }

      // Get documents
      const documents = await this.documentService.getDocumentsByPropertyId(
        propertyId,
        req.user.id
      );

      // Return success response
      res.status(200).json({
        success: true,
        data: mapDocumentsToDto(documents, `${req.protocol}://${req.get('host')}`),
      });
    } catch (error) {
      logger.error('Error retrieving documents', { module: 'documents', method: 'getDocumentsByPropertyId' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Get documents by user ID
   * @param req - The request object
   * @param res - The response object
   */
  getDocumentsByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const targetUserId = req.params.userId || req.user.id;

      // Get documents
      const documents = await this.documentService.getDocumentsByUserId(
        targetUserId,
        req.user.id
      );

      // Return success response
      res.status(200).json({
        success: true,
        data: mapDocumentsToDto(documents, `${req.protocol}://${req.get('host')}`),
      });
    } catch (error) {
      logger.error('Error retrieving documents', { module: 'documents', method: 'getDocumentsByUserId' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * List documents with pagination and filtering
   * @param req - The request object
   * @param res - The response object
   */
  listDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Validate query parameters
      const validationResult = ListDocumentsQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.format(),
        });
        return;
      }

      const { propertyId, userId, page, limit, includeDeleted } = validationResult.data;

      // Get documents with pagination
      const { documents, total } = await this.documentService.listDocuments(
        { propertyId, userId },
        page,
        limit,
        req.user.id,
        includeDeleted
      );

      // Return paginated response
      res.status(200).json({
        success: true,
        data: mapToPaginatedDocumentsDto(
          documents,
          `${req.protocol}://${req.get('host')}`,
          total,
          page,
          limit
        ),
      });
    } catch (error) {
      logger.error('Error listing documents', { module: 'documents', method: 'listDocuments' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Download a document
   * @param req - The request object
   * @param res - The response object
   */
  downloadDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Validate document ID
      const validationResult = DocumentIdParamSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid document ID',
          details: validationResult.error.format(),
        });
        return;
      }

      // Get document and stream
      const { document, stream } = await this.documentService.downloadDocument(
        validationResult.data.id,
        req.user.id
      );

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.setHeader('Content-Type', document.mimeType);

      // Stream the file
      stream.pipe(res);
    } catch (error) {
      logger.error('Error downloading document', { module: 'documents', method: 'downloadDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Preview a document
   * @param req - The request object
   * @param res - The response object
   */
  previewDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Validate document ID
      const validationResult = DocumentIdParamSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid document ID',
          details: validationResult.error.format(),
        });
        return;
      }

      // Get document and stream
      const { document, stream } = await this.documentService.previewDocument(
        validationResult.data.id,
        req.user.id
      );

      // Set headers for inline display
      res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
      res.setHeader('Content-Type', document.mimeType);

      // Stream the file
      stream.pipe(res);
    } catch (error) {
      logger.error('Error previewing document', { module: 'documents', method: 'previewDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Soft delete a document
   * @param req - The request object
   * @param res - The response object
   */
  softDeleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Validate document ID
      const validationResult = DocumentIdParamSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid document ID',
          details: validationResult.error.format(),
        });
        return;
      }

      // Soft delete the document
      await this.documentService.softDeleteDocument(
        validationResult.data.id,
        req.user.id
      );

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      logger.error('Error soft deleting document', { module: 'documents', method: 'softDeleteDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Restore a soft-deleted document
   * @param req - The request object
   * @param res - The response object
   */
  restoreDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Validate document ID
      const validationResult = DocumentIdParamSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid document ID',
          details: validationResult.error.format(),
        });
        return;
      }

      // Restore the document
      const document = await this.documentService.restoreDocument(
        validationResult.data.id,
        req.user.id
      );

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Document restored successfully',
        data: mapDocumentToDto(document, `${req.protocol}://${req.get('host')}`),
      });
    } catch (error) {
      logger.error('Error restoring document', { module: 'documents', method: 'restoreDocument' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  /**
   * Get document statistics
   * @param req - The request object
   * @param res - The response object
   */
  getStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Get statistics
      const stats = await this.documentService.getStatistics(req.user.id);

      // Return success response
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error retrieving document statistics', { module: 'documents', method: 'getStatistics' }, error instanceof Error ? error : new Error(String(error)));
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };
}