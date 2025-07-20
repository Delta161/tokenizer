import { PrismaClient, UserRole } from '@prisma/client';
import fs from 'fs';
import { getFilePath, sanitizeFilename } from './upload.middleware.js';
import { LocalStorageAdapter } from './storage.adapter.js';
import logger from '../../utils/logger.js';
export class DocumentService {
    prisma;
    storageAdapter;
    constructor(prisma, storageAdapter) {
        this.prisma = prisma || new PrismaClient();
        this.storageAdapter = storageAdapter || new LocalStorageAdapter();
    }
    /**
     * Upload a document and save its metadata to the database
     * @param userId - The ID of the user uploading the document
     * @param propertyId - The ID of the property the document is associated with (optional)
     * @param file - The uploaded file metadata from multer
     * @returns The created document record
     */
    async uploadDocument(userId, propertyId, file) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // If propertyId is provided, verify ownership or admin status
        if (propertyId) {
            const property = await this.prisma.property.findUnique({
                where: { id: propertyId },
                include: { client: true },
            });
            if (!property) {
                throw new Error('Property not found');
            }
            // Check if user is admin or the client who owns the property
            const isAdmin = user.role === UserRole.ADMIN;
            const isOwner = property.client?.userId === userId;
            if (!isAdmin && !isOwner) {
                throw new Error('You do not have permission to upload documents to this property');
            }
        }
        // Create document record in database
        return this.prisma.document.create({
            data: {
                propertyId: propertyId,
                userId: userId,
                filename: sanitizeFilename(file.filename),
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
            },
        });
    }
    /**
     * Get a document by its ID
     * @param documentId - The ID of the document to retrieve
     * @param userId - The ID of the user requesting the document
     * @returns The document record if found and accessible
     */
    async getDocumentById(documentId, userId) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Find the document
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                property: {
                    select: {
                        id: true,
                        clientId: true,
                        client: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new Error('Document not found');
        }
        // Check access permissions
        const isAdmin = user.role === UserRole.ADMIN;
        const isDocumentOwner = document.userId === userId;
        const isPropertyOwner = document.property?.client?.userId === userId;
        if (!isAdmin && !isDocumentOwner && !isPropertyOwner) {
            throw new Error('You do not have permission to access this document');
        }
        return document;
    }
    /**
     * Delete a document by its ID
     * @param documentId - The ID of the document to delete
     * @param userId - The ID of the user requesting deletion
     * @returns The deleted document record
     */
    async deleteDocument(documentId, userId) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Find the document
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                property: {
                    select: {
                        id: true,
                        clientId: true,
                        client: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new Error('Document not found');
        }
        // Check delete permissions
        const isAdmin = user.role === UserRole.ADMIN;
        const isDocumentOwner = document.userId === userId;
        if (!isAdmin && !isDocumentOwner) {
            throw new Error('You do not have permission to delete this document');
        }
        // Delete the file from the filesystem
        try {
            await fs.unlink(getFilePath(document.filename));
        }
        catch (error) {
            logger.error(`Failed to delete file ${document.filename}`, { module: 'documents', method: 'deleteDocument' }, error instanceof Error ? error : new Error(String(error)));
            // Continue with database deletion even if file deletion fails
        }
        // Delete the document record from the database
        return this.prisma.document.delete({
            where: { id: documentId },
        });
    }
    /**
     * Get documents by property ID
     * @param propertyId - The ID of the property
     * @param userId - The ID of the user requesting the documents
     * @returns Array of document records
     */
    async getDocumentsByPropertyId(propertyId, userId) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Verify property exists
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            include: { client: true },
        });
        if (!property) {
            throw new Error('Property not found');
        }
        // Check access permissions
        const isAdmin = user.role === UserRole.ADMIN;
        const isPropertyOwner = property.client?.userId === userId;
        if (!isAdmin && !isPropertyOwner) {
            throw new Error('You do not have permission to access documents for this property');
        }
        // Get documents for the property
        return this.prisma.document.findMany({
            where: { propertyId },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get documents by user ID
     * @param requestingUserId - The ID of the user making the request
     * @param targetUserId - The ID of the user whose documents to retrieve (optional, defaults to requesting user)
     * @returns Array of document records
     */
    async getDocumentsByUserId(requestingUserId, targetUserId) {
        // Verify requesting user exists
        const requestingUser = await this.prisma.user.findUnique({
            where: { id: requestingUserId },
        });
        if (!requestingUser) {
            throw new Error('User not found');
        }
        // If no target user ID is provided, use the requesting user's ID
        const userId = targetUserId || requestingUserId;
        // If requesting a different user's documents, check permissions
        if (userId !== requestingUserId) {
            const isAdmin = requestingUser.role === UserRole.ADMIN;
            if (!isAdmin) {
                throw new Error('You do not have permission to access documents for this user');
            }
            // Verify target user exists
            const targetUser = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!targetUser) {
                throw new Error('Target user not found');
            }
        }
        // Get documents for the user
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * List documents with pagination and filtering
     * @param userId - The ID of the user making the request
     * @param filter - Filter criteria for documents
     * @returns Array of document records and total count
     */
    async listDocuments(userId, filter) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const isAdmin = user.role === UserRole.ADMIN;
        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const skip = (page - 1) * limit;
        // Build where clause based on filters and permissions
        let where = {};
        // Filter by property ID if provided
        if (filter.propertyId) {
            where.propertyId = filter.propertyId;
            // If not admin, verify property ownership
            if (!isAdmin) {
                const property = await this.prisma.property.findUnique({
                    where: { id: filter.propertyId },
                    include: { client: true },
                });
                if (!property) {
                    throw new Error('Property not found');
                }
                const isPropertyOwner = property.client?.userId === userId;
                if (!isPropertyOwner) {
                    throw new Error('You do not have permission to access documents for this property');
                }
            }
        }
        // Filter by user ID if provided
        if (filter.userId) {
            where.userId = filter.userId;
            // If not admin and not requesting own documents, deny access
            if (!isAdmin && filter.userId !== userId) {
                throw new Error('You do not have permission to access documents for this user');
            }
        }
        else if (!isAdmin) {
            // If not admin and no specific user filter, only show own documents
            where.userId = userId;
        }
        // Include soft-deleted documents if requested and user is admin
        if (filter.includeDeleted && isAdmin) {
            // Include all documents regardless of deleted status
        }
        else {
            where.deletedAt = null;
        }
        // Count total matching documents
        const total = await this.prisma.document.count({ where });
        // Get paginated documents
        const documents = await this.prisma.document.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        return { documents, total };
    }
    /**
     * Soft delete a document by marking it as deleted
     * @param documentId - The ID of the document to soft delete
     * @param userId - The ID of the user requesting deletion
     * @returns The updated document record
     */
    async softDeleteDocument(documentId, userId) {
        // Verify user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Find the document
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                property: {
                    select: {
                        id: true,
                        clientId: true,
                        client: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new Error('Document not found');
        }
        // Check delete permissions
        const isAdmin = user.role === UserRole.ADMIN;
        const isDocumentOwner = document.userId === userId;
        if (!isAdmin && !isDocumentOwner) {
            throw new Error('You do not have permission to delete this document');
        }
        // Soft delete the document by setting deletedAt
        return this.prisma.document.update({
            where: { id: documentId },
            data: { deletedAt: new Date() },
        });
    }
    /**
     * Restore a soft-deleted document
     * @param documentId - The ID of the document to restore
     * @param userId - The ID of the user requesting restoration
     * @returns The updated document record
     */
    async restoreDocument(documentId, userId) {
        // Verify user exists and is an admin
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== UserRole.ADMIN) {
            throw new Error('Only administrators can restore documents');
        }
        // Find the document
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            throw new Error('Document not found');
        }
        // Restore the document by clearing deletedAt
        return this.prisma.document.update({
            where: { id: documentId },
            data: { deletedAt: null },
        });
    }
    /**
     * Get document statistics
     * @param userId - The ID of the user requesting statistics
     * @returns Document statistics
     */
    async getStatistics(userId) {
        // Verify user exists and is an admin
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== UserRole.ADMIN) {
            throw new Error('Only administrators can view document statistics');
        }
        // Get total document count
        const total = await this.prisma.document.count();
        // Get document count by property
        const byPropertyRaw = await this.prisma.$queryRaw `
      SELECT 
        d."propertyId", 
        p.title as "propertyTitle", 
        COUNT(d.id) as count
      FROM "Document" d
      JOIN "Property" p ON d."propertyId" = p.id
      WHERE d."propertyId" IS NOT NULL
      GROUP BY d."propertyId", p.title
      ORDER BY count DESC
      LIMIT 10
    `;
        // Get document count by user
        const byUserRaw = await this.prisma.$queryRaw `
      SELECT 
        d."userId", 
        CONCAT(u."firstName", ' ', u."lastName") as "userName", 
        COUNT(d.id) as count
      FROM "Document" d
      JOIN "User" u ON d."userId" = u.id
      WHERE d."userId" IS NOT NULL
      GROUP BY d."userId", u."firstName", u."lastName"
      ORDER BY count DESC
      LIMIT 10
    `;
        // Convert BigInt to number for JSON serialization
        const byProperty = byPropertyRaw.map(item => ({
            propertyId: item.propertyId,
            propertyTitle: item.propertyTitle,
            count: Number(item.count),
        }));
        const byUser = byUserRaw.map(item => ({
            userId: item.userId,
            userName: item.userName,
            count: Number(item.count),
        }));
        return {
            total,
            byProperty,
            byUser,
        };
    }
    /**
     * Download a document
     * @param documentId - The ID of the document to download
     * @param userId - The ID of the user requesting the download
     * @returns The document record and a readable stream of the file
     */
    async downloadDocument(documentId, userId) {
        // Get the document (this will check permissions)
        const document = await this.getDocumentById(documentId, userId);
        // Get a readable stream for the file
        const stream = this.storageAdapter.download(getFilePath(document.filename));
        return { document, stream };
    }
}
// Note: sanitizeFilename is now imported from upload.middleware.js
//# sourceMappingURL=documents.service.js.map