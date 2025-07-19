import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DocumentService } from './documents.service.js';
import { DocumentController } from './documents.controller.js';
import { createDocumentsRouter, mountDocumentsRoutes } from './documents.routes.js';
import { LocalStorageAdapter, StorageAdapter } from './storage.adapter.js';

// Export types
export * from './documents.types.js';

// Export utilities
export * from './documents.mapper.js';

// Export middleware
export * from './upload.middleware.js';

// Export storage adapter
export * from './storage.adapter.js';

/**
 * Initialize the document module
 * @param prisma - PrismaClient instance
 * @returns Object containing initialized services and controllers
 */
export function initDocumentModule(prisma?: PrismaClient, storageAdapter?: StorageAdapter) {
  // Create instances or use provided ones
  const prismaClient = prisma || new PrismaClient();
  const storage = storageAdapter || new LocalStorageAdapter();
  
  // Initialize services
  const documentService = new DocumentService(prismaClient, storage);
  
  // Initialize controllers
  const documentController = new DocumentController(prismaClient, storage);
  
  // Create router
  const documentsRouter = createDocumentsRouter(prismaClient);
  
  return {
    documentService,
    documentController,
    documentsRouter,
  };
}

// Export functions for mounting routes
export { createDocumentsRouter, mountDocumentsRoutes };

// Export service and controller classes
export { DocumentService, DocumentController };