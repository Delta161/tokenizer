import { PrismaClient } from '@prisma/client';
import { StorageAdapter } from './utils/storage.adapter.js';
import { LocalStorageAdapter } from './utils/storage.adapter.js';

// Export controllers
export * from './controllers/index.js';

// Export services
export * from './services/index.js';

// Export routes
export * from './routes/index.js';

// Export types
export * from './types/index.js';

// Export validators
export * from './validators/index.js';

// Export utils
export * from './utils/index.js';

/**
 * Initialize the document module
 * @param prisma - PrismaClient instance
 * @returns Object containing initialized services and controllers
 */
export async function initDocumentModule(prisma?: PrismaClient, storageAdapter?: StorageAdapter) {
  // Create instances or use provided ones
  const prismaClient = prisma || new PrismaClient();
  const storage = storageAdapter || new LocalStorageAdapter();
  
  // Initialize services
  const { DocumentService } = await import('./services/documents.service.js');
  const documentService = new DocumentService(prismaClient, storage);
  
  // Initialize controllers
  const { DocumentController } = await import('./controllers/documents.controller.js');
  const documentController = new DocumentController(prismaClient, storage);
  
  // Create router
  const { createDocumentsRouter } = await import('./routes/documents.routes.js');
  const documentsRouter = createDocumentsRouter(prismaClient);
  
  return {
    documentService,
    documentController,
    documentsRouter,
  };
}