/**
 * Maps a Document entity to a DocumentDto
 * @param document - The document entity from the database
 * @param baseUrl - The base URL for generating download links
 * @returns A DocumentDto with download URL
 */
export const mapDocumentToDto = (document, baseUrl) => {
    // Ensure baseUrl doesn't end with a slash
    const normalizedBaseUrl = baseUrl.endsWith('/')
        ? baseUrl.slice(0, -1)
        : baseUrl;
    return {
        id: document.id,
        propertyId: document.propertyId,
        userId: document.userId,
        filename: document.filename,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: document.size,
        downloadUrl: `${normalizedBaseUrl}/documents/${document.id}`,
        createdAt: document.createdAt,
    };
};
/**
 * Maps an array of Document entities to DocumentDtos
 * @param documents - The document entities from the database
 * @param baseUrl - The base URL for generating download links
 * @returns An array of DocumentDtos with download URLs
 */
export const mapDocumentsToDto = (documents, baseUrl) => {
    return documents.map(document => mapDocumentToDto(document, baseUrl));
};
/**
 * Maps documents with pagination information to a PaginatedDocumentsDto
 * @param documents - The document entities from the database
 * @param baseUrl - The base URL for generating download links
 * @param total - The total number of documents matching the query
 * @param page - The current page number
 * @param limit - The number of documents per page
 * @returns A PaginatedDocumentsDto with documents and pagination info
 */
export const mapToPaginatedDocumentsDto = (documents, baseUrl, total, page, limit) => {
    return {
        data: mapDocumentsToDto(documents, baseUrl),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
