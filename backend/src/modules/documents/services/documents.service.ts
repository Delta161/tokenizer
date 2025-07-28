import { Document, PrismaClient, UserRole } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { getFilePath, sanitizeFilename } from '../utils/upload.middleware.js';
import { DocumentStatsDto, ListDocumentsQuery } from '../types/documents.types.js';
import { LocalStorageAdapter, StorageAdapter } from '../utils/storage.adapter.js';
import { logger } from '@utils/logger';
import { PAGINATION } from '@config/constants';
import { getSkipValue } from '@utils/pagination';

export class DocumentService {
  private prisma: PrismaClient;
  private storageAdapter: StorageAdapter;

  constructor(prisma?: PrismaClient, storageAdapter?: StorageAdapter) {
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
  async uploadDocument(
    userId: string,
    propertyId: string | null,
    file: Express.Multer.File
  ): Promise<Document> {
    logger.info('Uploading document', { userId, propertyId, filename: file.originalname });
    
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
    logger.info('Getting document by ID', { documentId, userId });
    
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

    // Check if user has access to the document
    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = document.userId === userId;
    const isPropertyOwner = document.property?.client?.userId === userId;

    if (!isAdmin && !isOwner && !isPropertyOwner) {
      throw new Error('You do not have permission to access this document');
    }

    return document;
  }

  /**
   * Delete a document
   * @param documentId - The ID of the document to delete
   * @param userId - The ID of the user requesting deletion
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    logger.info('Deleting document', { documentId, userId });
    
    // Get the document (this will also check permissions)
    const document = await this.getDocumentById(documentId, userId);

    // Delete the file from storage
    await this.storageAdapter.delete(document.path);

    // Delete the document record from the database
    await this.prisma.document.delete({
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
    logger.info('Getting documents by property ID', { propertyId, userId });
    
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

    // Check if user has access to the property's documents
    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = property.client?.userId === userId;

    if (!isAdmin && !isOwner) {
      throw new Error('You do not have permission to access documents for this property');
    }

    // Get documents for the property
    return this.prisma.document.findMany({
      where: {
        propertyId: propertyId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get documents by user ID
   * @param requestingUserId - The ID of the user making the request
   * @param targetUserId - The ID of the user whose documents to retrieve
   * @returns Array of document records
   */
  async getDocumentsByUserId(requestingUserId: string, targetUserId: string): Promise<Document[]> {
    logger.info('Getting documents by user ID', { requestingUserId, targetUserId });
    
    // Verify requesting user exists
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!requestingUser) {
      throw new Error('User not found');
    }

    // Check if requesting user has permission to view target user's documents
    const isAdmin = requestingUser.role === UserRole.ADMIN;
    const isSelf = requestingUserId === targetUserId;

    if (!isAdmin && !isSelf) {
      throw new Error('You do not have permission to access documents for this user');
    }

    // Get documents for the user
    return this.prisma.document.findMany({
      where: {
        userId: targetUserId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List documents with pagination and filtering
   * @param userId - The ID of the user making the request
   * @param options - Pagination and filtering options
   * @returns Object containing documents and total count
   */
  async listDocuments(
    userId: string,
    options: ListDocumentsQuery
  ): Promise<{ documents: Document[]; total: number }> {
    logger.info('Listing documents', { userId, options });
    
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Build where clause based on user role and options
    const isAdmin = user.role === UserRole.ADMIN;
    let whereClause: any = {};

    // If not admin, restrict to documents the user has access to
    if (!isAdmin) {
      whereClause = {
        OR: [
          { userId: userId },
          {
            property: {
              client: {
                userId: userId,
              },
            },
          },
        ],
      };
    }

    // Apply property filter if provided
    if (options.propertyId) {
      whereClause.propertyId = options.propertyId;
    }

    // Apply user filter if provided
    if (options.userId) {
      // Only admins can filter by user other than themselves
      if (!isAdmin && options.userId !== userId) {
        throw new Error('You do not have permission to access documents for this user');
      }
      whereClause.userId = options.userId;
    }

    // Apply deleted filter
    if (!options.includeDeleted) {
      whereClause.deletedAt = null;
    }

    // Get total count
    const total = await this.prisma.document.count({
      where: whereClause,
    });

    // Get documents with pagination
    const documents = await this.prisma.document.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: getSkipValue(options.page, options.limit),
      take: options.limit,
    });

    return { documents, total };
  }

  /**
   * Get a readable stream for a document
   * @param filePath - The path to the document file
   * @returns Readable stream of the document
   */
  getDocumentStream(filePath: string): Readable {
    return this.storageAdapter.download(filePath);
  }

  /**
   * Soft delete a document
   * @param documentId - The ID of the document to soft delete
   * @param userId - The ID of the user requesting the soft deletion
   */
  async softDeleteDocument(documentId: string, userId: string): Promise<void> {
    logger.info('Soft deleting document', { documentId, userId });
    
    // Get the document (this will also check permissions)
    await this.getDocumentById(documentId, userId);

    // Update the document record to mark as deleted
    await this.prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft-deleted document
   * @param documentId - The ID of the document to restore
   * @param userId - The ID of the user requesting the restoration
   */
  async restoreDocument(documentId: string, userId: string): Promise<void> {
    logger.info('Restoring document', { documentId, userId });
    
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

    // Find the document
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Update the document record to remove deleted flag
    await this.prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: null },
    });
  }

  /**
   * Get document statistics
   * @returns Document statistics
   */
  async getStatistics(): Promise<DocumentStatsDto> {
    logger.info('Getting document statistics');
    
    // Get total document count
    const total = await this.prisma.document.count();

    // Get document count by property
    const byProperty = await this.prisma.$queryRaw<Array<{ propertyId: string; propertyTitle: string; count: number }>>`
      SELECT 
        p.id as "propertyId", 
        p.title as "propertyTitle", 
        COUNT(d.id) as count
      FROM "Document" d
      JOIN "Property" p ON d."propertyId" = p.id
      GROUP BY p.id, p.title
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get document count by user
    const byUser = await this.prisma.$queryRaw<Array<{ userId: string; userName: string; count: number }>>`
      SELECT 
        u.id as "userId", 
        u."fullName" as "userName", 
        COUNT(d.id) as count
      FROM "Document" d
      JOIN "User" u ON d."userId" = u.id
      GROUP BY u.id, u."fullName"
      ORDER BY count DESC
      LIMIT 10
    `;

    return {
      total,
      byProperty,
      byUser,
    };
  }
}