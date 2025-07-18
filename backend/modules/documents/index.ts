import { PrismaClient } from '@prisma/client';
import { DocumentService } from './services/documents.service.js';
import { DocumentController } from './controllers/documents.controller.js';
import { createDocumentsRouter } from './routes/documents.routes.js';
import { Router } from 'express';
import { StorageAdapter, LocalStorageAdapter } from './utils/storage.adapter.js';

/**
 * Initialize the Document module
 * @param prisma - The Prisma client instance
 * @returns Object containing the initialized services, controllers, and routes
 */
export const initDocumentModule = (prisma: PrismaClient) => {
  // Initialize services
  const storageAdapter = new LocalStorageAdapter();
  const documentService = new DocumentService(prisma, storageAdapter);

  // Initialize controllers
  const documentController = new DocumentController(documentService);

  // Initialize routes
  const documentRouter = createDocumentsRouter(documentController);

  return {
    services: {
      documentService,
    },
    controllers: {
      documentController,
    },
    routes: documentRouter,
  };
};

/**
 * Mount document routes to an existing Express router
 * @param router - The Express router to mount routes on
 * @param documentRouter - The document router to mount
 * @param basePath - The base path for document routes (default: '/documents')
 */
export const mountDocumentRoutes = (
  router: Router,
  documentRouter: Router,
  basePath: string = '/documents'
) => {
  router.use(basePath, documentRouter);
};

// Export types and utilities
export * from './types/documents.types.js';
export * from './utils/documents.mapper.js';
export * from './middleware/upload.middleware.js';
export * from './utils/storage.adapter.js';