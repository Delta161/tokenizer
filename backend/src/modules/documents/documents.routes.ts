import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DocumentController } from './documents.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { singleFile } from './upload.middleware.js';
import { UserRole } from '@prisma/client';

/**
 * Create and configure the documents router
 * @param prisma - PrismaClient instance
 * @returns Configured Express router
 */
export function createDocumentsRouter(prisma?: PrismaClient): Router {
  const router = express.Router();
  const documentController = new DocumentController(prisma);

  // Apply authentication middleware to all routes
  router.use(requireAuth);

  // Upload document
  router.post(
    '/upload',
    requireRole([UserRole.CLIENT, UserRole.ADMIN]),
    singleFile,
    documentController.uploadDocument.bind(documentController)
  );

  // List documents with pagination and filtering
  router.get(
    '/',
    documentController.listDocuments.bind(documentController)
  );

  // Get document statistics (admin only)
  router.get(
    '/stats',
    requireRole([UserRole.ADMIN]),
    documentController.getStatistics.bind(documentController)
  );

  // Get documents by property ID
  router.get(
    '/property/:propertyId',
    documentController.getDocumentsByPropertyId.bind(documentController)
  );

  // Get documents by user ID (optional parameter, defaults to current user)
  router.get(
    '/user/:userId?',
    documentController.getDocumentsByUserId.bind(documentController)
  );

  // Get document by ID
  router.get(
    '/:id',
    documentController.getDocumentById.bind(documentController)
  );

  // Download document
  router.get(
    '/:id/download',
    documentController.downloadDocument.bind(documentController)
  );

  // Preview document
  router.get(
    '/:id/preview',
    documentController.previewDocument.bind(documentController)
  );

  // Delete document
  router.delete(
    '/:id',
    documentController.deleteDocument.bind(documentController)
  );

  // Soft delete document
  router.patch(
    '/:id/delete',
    documentController.softDeleteDocument.bind(documentController)
  );

  // Restore soft-deleted document (admin only)
  router.patch(
    '/:id/restore',
    requireRole([UserRole.ADMIN]),
    documentController.restoreDocument.bind(documentController)
  );

  return router;
}

/**
 * Mount the documents router to an existing Express router
 * @param app - Express router to mount on
 * @param path - Path to mount the router at
 * @param prisma - PrismaClient instance
 * @returns The mounted router
 */
export function mountDocumentsRoutes(app: Router, path: string = '/documents', prisma?: PrismaClient): Router {
  const documentsRouter = createDocumentsRouter(prisma);
  app.use(path, documentsRouter);
  return app;
}