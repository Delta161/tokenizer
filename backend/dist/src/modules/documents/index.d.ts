import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { DocumentService } from './documents.service.js';
import { DocumentController } from './documents.controller.js';
import { createDocumentsRouter, mountDocumentsRoutes } from './documents.routes.js';
import { StorageAdapter } from './storage.adapter.js';
export * from './documents.types.js';
export * from './documents.mapper.js';
export * from './upload.middleware.js';
export * from './storage.adapter.js';
/**
 * Initialize the document module
 * @param prisma - PrismaClient instance
 * @returns Object containing initialized services and controllers
 */
export declare function initDocumentModule(prisma?: PrismaClient, storageAdapter?: StorageAdapter): {
    documentService: DocumentService;
    documentController: DocumentController;
    documentsRouter: Router;
};
export { createDocumentsRouter, mountDocumentsRoutes };
export { DocumentService, DocumentController };
//# sourceMappingURL=index.d.ts.map