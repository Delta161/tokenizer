import { Document } from '@prisma/client';
import { DocumentDto, DocumentWithRelations, PaginatedDocumentsDto } from '../types/documents.types.js';
/**
 * Maps a Document entity to a DocumentDto
 * @param document - The document entity from the database
 * @param baseUrl - The base URL for generating download links
 * @returns A DocumentDto with download URL
 */
export declare const mapDocumentToDto: (document: Document | DocumentWithRelations, baseUrl: string) => DocumentDto;
/**
 * Maps an array of Document entities to DocumentDtos
 * @param documents - The document entities from the database
 * @param baseUrl - The base URL for generating download links
 * @returns An array of DocumentDtos with download URLs
 */
export declare const mapDocumentsToDto: (documents: Document[] | DocumentWithRelations[], baseUrl: string) => DocumentDto[];
/**
 * Maps documents with pagination information to a PaginatedDocumentsDto
 * @param documents - The document entities from the database
 * @param baseUrl - The base URL for generating download links
 * @param total - The total number of documents matching the query
 * @param page - The current page number
 * @param limit - The number of documents per page
 * @returns A PaginatedDocumentsDto with documents and pagination info
 */
export declare const mapToPaginatedDocumentsDto: (documents: Document[] | DocumentWithRelations[], baseUrl: string, total: number, page: number, limit: number) => PaginatedDocumentsDto;
//# sourceMappingURL=documents.mapper.d.ts.map