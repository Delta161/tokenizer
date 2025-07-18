import { Router } from 'express';
import { requireAuth } from '../../auth/requireAuth.js';
import { requireRole } from '../../auth/requireRole.js';
import { UserRole } from '@prisma/client';
import { singleFile } from '../middleware/upload.middleware.js';
/**
 * Create and configure the documents router
 * @param documentController - The document controller instance
 * @returns Configured Express router
 */
export const createDocumentsRouter = (documentController) => {
    const router = Router();
    // Apply authentication middleware to all routes
    router.use(requireAuth);
    // Upload document route
    // Protected by requireAuth and requireRole('CLIENT','ADMIN')
    router.post('/upload', requireRole([UserRole.CLIENT, UserRole.ADMIN]), singleFile('document'), documentController.uploadDocument);
    // List documents with pagination and filtering
    // Protected by requireAuth and ownership check in service
    router.get('/', documentController.listDocuments);
    // Get document statistics route
    // Protected by requireAuth and requireRole('ADMIN')
    router.get('/stats', requireRole([UserRole.ADMIN]), documentController.getStatistics);
    // Get documents by property ID route
    // Protected by requireAuth and ownership check in service
    router.get('/property/:propertyId', documentController.getDocumentsByPropertyId);
    // Get documents by user ID route
    // Protected by requireAuth and ownership check in service
    router.get('/user/:userId?', documentController.getDocumentsByUserId);
    // Get document by ID route
    // Protected by requireAuth
    router.get('/:id', documentController.getDocumentById);
    // Download document route
    // Protected by requireAuth and ownership check in service
    router.get('/:id/download', documentController.downloadDocument);
    // Preview document route
    // Protected by requireAuth and ownership check in service
    router.get('/:id/preview', documentController.previewDocument);
    // Delete document route
    // Protected by requireAuth and ownership check in service
    router.delete('/:id', documentController.deleteDocument);
    // Soft delete document route
    // Protected by requireAuth and ownership check in service
    router.patch('/:id/delete', documentController.softDeleteDocument);
    // Restore document route
    // Protected by requireAuth and requireRole('ADMIN')
    router.patch('/:id/restore', requireRole([UserRole.ADMIN]), documentController.restoreDocument);
    return router;
};
//# sourceMappingURL=documents.routes.js.map