import { Document } from '@prisma/client';
import { DocumentDto, PaginatedDocumentsDto, ListDocumentsQuery } from '../types/documents.types.js';
import { getBaseUrl } from '@utils/url';

/**
 * Maps a Document entity to a DocumentDto
 * @param document - The document entity to map
 * @returns The mapped DocumentDto
 */
export function mapDocumentToDto(document: Document): DocumentDto {
  const baseUrl = getBaseUrl();
  const downloadUrl = `${baseUrl}/api/documents/${document.id}/download`;
  const previewUrl = `${baseUrl}/api/documents/${document.id}/preview`;

  return {
    id: document.id,
    propertyId: document.propertyId,
    userId: document.userId,
    filename: document.filename,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    downloadUrl,
    previewUrl,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    deletedAt: document.deletedAt,
  };
}

/**
 * Maps an array of Document entities to an array of DocumentDtos
 * @param documents - The document entities to map
 * @returns The mapped DocumentDtos
 */
export function mapDocumentsToDto(documents: Document[]): DocumentDto[] {
  return documents.map(mapDocumentToDto);
}

/**
 * Maps documents and pagination info to a PaginatedDocumentsDto
 * @param documents - The document entities to map
 * @param total - The total number of documents
 * @param query - The query parameters used for pagination
 * @returns The mapped PaginatedDocumentsDto
 */
export function mapToPaginatedDocumentsDto(
  documents: Document[],
  total: number,
  query: ListDocumentsQuery
): PaginatedDocumentsDto {
  const { page, limit } = query;
  const totalPages = Math.ceil(total / limit);

  return {
    data: mapDocumentsToDto(documents),
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}