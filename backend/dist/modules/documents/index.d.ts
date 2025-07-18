import { PrismaClient } from '@prisma/client';
import { DocumentService } from './services/documents.service.js';
import { DocumentController } from './controllers/documents.controller.js';
import { Router } from 'express';
/**
 * Initialize the Document module
 * @param prisma - The Prisma client instance
 * @returns Object containing the initialized services, controllers, and routes
 */
export declare const initDocumentModule: (prisma: PrismaClient) => {
    services: {
        documentService: DocumentService;
    };
    controllers: {
        documentController: DocumentController;
    };
    routes: Router;
};
/**
 * Mount document routes to an existing Express router
 * @param router - The Express router to mount routes on
 * @param documentRouter - The document router to mount
 * @param basePath - The base path for document routes (default: '/documents')
 */
export declare const mountDocumentRoutes: (router: Router, documentRouter: Router, basePath?: string) => void;
export * from './types/documents.types.js';
export * from './utils/documents.mapper.js';
export * from './middleware/upload.middleware.js';
export * from './utils/storage.adapter.js';
//# sourceMappingURL=index.d.ts.map