import { Document, PrismaClient, UserRole } from '@prisma/client';
import fs from 'fs';
import { getFilePath } from '../middleware/upload.middleware.js';
import { DocumentStatsDto, ListDocumentsQuery } from '../types/documents.types.js';
import { LocalStorageAdapter, StorageAdapter } from '../utils/storage.adapter.js';

export class DocumentService {
  private prisma: PrismaClient;
  private storageAdapter: StorageAdapter;

  constructor(prisma: PrismaClient, storageAdapter?: StorageAdapter) {
    this.prisma = prisma;
    this.storageAdapter = storageAdapter || new LocalStorageAdapter();
  }

  /**
   * Upload a document and save its metadata to the database
   * @param userId - The ID of the user uploading the document
   * @param propertyId - The ID of the property the document is associated with (optional)
   * @param file - The uploaded file metadata from multer
   * @returns The created document record
   */
  async uploadDocument(
    userId: string,
    propertyId: string | null,
    file: Express.Multer.File
  ): Promise<Document> {
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
  async getDocumentById(documentId: string, userId: string): Promise<Document> {
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
  async deleteDocument(documentId: string, userId: string): Promise<Document> {
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
    } catch (error) {
      console.error(`Failed to delete file ${document.filename}:`, error);
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
  async getDocumentsByPropertyId(propertyId: string, userId: string): Promise<Document[]> {
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

    // Retrieve documents
    return this.prisma.document.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get documents by user ID
   * @param targetUserId - The ID of the user whose documents to retrieve
   * @param requestingUserId - The ID of the user making the request
   * @returns Array of document records
   */
  async getDocumentsByUserId(targetUserId: string, requestingUserId: string): Promise<Document[]> {
    // Verify requesting user exists
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!requestingUser) {
      throw new Error('User not found');
    }

    // Check access permissions
    const isAdmin = requestingUser.role === UserRole.ADMIN;
    const isSameUser = targetUserId === requestingUserId;

    if (!isAdmin && !isSameUser) {
      throw new Error('You do not have permission to access these documents');
    }

    // Retrieve documents
    return this.prisma.document.findMany({
      where: { 
        userId: targetUserId,
        deletedAt: null 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List documents with pagination and filtering
   * @param filters - Filters to apply (propertyId, userId)
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @param requestingUserId - ID of the user making the request
   * @param includeDeleted - Whether to include soft-deleted documents
   * @returns Object containing documents and pagination info
   */
  async listDocuments(
    filters: { propertyId?: string; userId?: string },
    page: number,
    limit: number,
    requestingUserId: string,
    includeDeleted: boolean = false
  ): Promise<{ documents: Document[]; total: number }> {
    // Verify requesting user exists
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!requestingUser) {
      throw new Error('User not found');
    }

    const isAdmin = requestingUser.role === UserRole.ADMIN;
    const skip = (page - 1) * limit;

    // Build where clause based on filters and permissions
    const where: any = {};

    // Apply propertyId filter if provided
    if (filters.propertyId) {
      where.propertyId = filters.propertyId;

      // Check if user has access to this property
      if (!isAdmin) {
        const property = await this.prisma.property.findUnique({
          where: { id: filters.propertyId },
          include: { client: true },
        });

        if (!property) {
          throw new Error('Property not found');
        }

        const isPropertyOwner = property.client?.userId === requestingUserId;

        if (!isPropertyOwner) {
          throw new Error('You do not have permission to access documents for this property');
        }
      }
    }

    // Apply userId filter if provided
    if (filters.userId) {
      where.userId = filters.userId;

      // Check if user has access to these documents
      if (!isAdmin && filters.userId !== requestingUserId) {
        throw new Error('You do not have permission to access these documents');
      }
    }

    // If not admin and no filters provided, only show user's own documents
    if (!isAdmin && !filters.propertyId && !filters.userId) {
      where.userId = requestingUserId;
    }

    // Apply soft delete filter unless explicitly including deleted items
    if (!includeDeleted || !isAdmin) {
      where.deletedAt = null;
    }

    // Get total count for pagination
    const total = await this.prisma.document.count({ where });

    // Get documents with pagination
    const documents = await this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return { documents, total };
  }

  /**
   * Download a document
   * @param id - Document ID
   * @param userId - ID of the user making the request
   * @returns Document record and readable stream
   */
  async downloadDocument(id: string, userId: string): Promise<{ document: Document; stream: fs.ReadStream }> {
    // Get document with access check
    const document = await this.getDocumentById(id, userId);

    // Get file path
    const filePath = getFilePath(document.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found on server');
    }

    // Create readable stream
    const stream = this.storageAdapter.download(filePath);

    return { document, stream };
  }

  /**
   * Preview a document
   * @param id - Document ID
   * @param userId - ID of the user making the request
   * @returns Document record and readable stream
   */
  async previewDocument(id: string, userId: string): Promise<{ document: Document; stream: fs.ReadStream }> {
    // For now, preview is the same as download
    // In a future enhancement, this could generate thumbnails for PDFs or resize images
    return this.downloadDocument(id, userId);
  }

  /**
   * Soft delete a document
   * @param id - Document ID
   * @param userId - ID of the user making the request
   * @returns Updated document record
   */
  async softDeleteDocument(id: string, userId: string): Promise<Document> {
    // Verify document exists
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check access permissions
    const isAdmin = user.role === UserRole.ADMIN;
    const isDocumentOwner = document.userId === userId;

    // If document is associated with a property, check if user is the property owner
    let isPropertyOwner = false;
    if (document.propertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: document.propertyId },
        include: { client: true },
      });

      isPropertyOwner = property?.client?.userId === userId;
    }

    if (!isAdmin && !isDocumentOwner && !isPropertyOwner) {
      throw new Error('You do not have permission to delete this document');
    }

    // Soft delete the document
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft-deleted document
   * @param id - Document ID
   * @param userId - ID of the user making the request
   * @returns Updated document record
   */
  async restoreDocument(id: string, userId: string): Promise<Document> {
    // Verify user exists and is an admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error('Only administrators can restore deleted documents');
    }

    // Verify document exists
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Restore the document
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Get document statistics
   * @param userId - ID of the user making the request (must be admin)
   * @returns Document statistics
   */
  async getStatistics(userId: string): Promise<DocumentStatsDto> {
    // Verify user exists and is an admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error('Only administrators can access document statistics');
    }

    // Get total document count
    const total = await this.prisma.document.count({
      where: { deletedAt: null },
    });

    // Get document counts by property
    const propertyStats = await this.prisma.$queryRaw<Array<{ propertyId: string, propertyTitle: string, count: number }>>`
      SELECT d."propertyId", p.title as "propertyTitle", COUNT(*) as count
      FROM "Document" d
      JOIN "Property" p ON d."propertyId" = p.id
      WHERE d."deletedAt" IS NULL AND d."propertyId" IS NOT NULL
      GROUP BY d."propertyId", p.title
      ORDER BY count DESC
    `;

    // Get document counts by user
    const userStats = await this.prisma.$queryRaw<Array<{ userId: string, userName: string, count: number }>>`
      SELECT d."userId", u."fullName" as "userName", COUNT(*) as count
      FROM "Document" d
      JOIN "User" u ON d."userId" = u.id
      WHERE d."deletedAt" IS NULL AND d."userId" IS NOT NULL
      GROUP BY d."userId", u."fullName"
      ORDER BY count DESC
    `;

    return {
      total,
      byProperty: propertyStats,
      byUser: userStats,
    };
  }
}