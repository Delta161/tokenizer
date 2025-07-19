# Documents Module

## Overview

The Documents module provides functionality for managing document uploads, storage, and retrieval within the application. It supports associating documents with properties or users, permission-based access control, and various document operations.

## Features

- **Document Upload**: Upload documents and associate them with properties or users
- **Secure Storage**: Store documents securely with randomized filenames
- **Access Control**: Permission-based access to documents based on user roles and ownership
- **Document Operations**: Download, preview, delete, and restore documents
- **Filtering & Pagination**: List documents with filtering and pagination support
- **Statistics**: Generate document usage statistics for administrators

## Module Structure

- `documents.types.ts`: Type definitions for document-related data structures
- `documents.validators.ts`: Request validation schemas using Zod
- `documents.mapper.ts`: Functions to map database entities to DTOs
- `documents.service.ts`: Business logic for document operations
- `documents.controller.ts`: HTTP request handlers
- `documents.routes.ts`: API route definitions
- `upload.middleware.ts`: File upload handling using Multer
- `storage.adapter.ts`: Storage abstraction for document files
- `index.ts`: Module exports and initialization

## Usage

### Initializing the Module

```typescript
import { initDocumentModule } from './modules/documents';
import { PrismaClient } from '@prisma/client';

// Initialize with existing PrismaClient instance
const prisma = new PrismaClient();
const { documentService, documentController, documentsRouter } = initDocumentModule(prisma);

// Or let the module create its own instances
const { documentService, documentController, documentsRouter } = initDocumentModule();
```

### Mounting Routes

```typescript
import express from 'express';
import { mountDocumentsRoutes } from './modules/documents';

const app = express();

// Mount at default path (/documents)
mountDocumentsRoutes(app);

// Or specify a custom path
mountDocumentsRoutes(app, '/api/documents');
```

### Uploading Documents

```typescript
// In a controller or service
import { DocumentService } from './modules/documents';

const documentService = new DocumentService();

// Upload document associated with a property
const document = await documentService.uploadDocument(
  userId,
  propertyId,
  file // Express.Multer.File object
);

// Upload document associated with a user only
const document = await documentService.uploadDocument(
  userId,
  null, // No property association
  file
);
```

## API Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------||
| POST | `/upload` | Upload a new document | CLIENT, ADMIN |
| GET | `/` | List documents with pagination and filtering | Any authenticated |
| GET | `/stats` | Get document statistics | ADMIN |
| GET | `/property/:propertyId` | Get documents by property ID | Property owner, ADMIN |
| GET | `/user/:userId?` | Get documents by user ID | Own documents or ADMIN |
| GET | `/:id` | Get document by ID | Document owner, Property owner, ADMIN |
| GET | `/:id/download` | Download document | Document owner, Property owner, ADMIN |
| GET | `/:id/preview` | Preview document | Document owner, Property owner, ADMIN |
| DELETE | `/:id` | Delete document | Document owner, ADMIN |
| PATCH | `/:id/delete` | Soft delete document | Document owner, ADMIN |
| PATCH | `/:id/restore` | Restore soft-deleted document | ADMIN |

## Query Parameters

The list documents endpoint (`GET /`) supports the following query parameters:

- `propertyId`: Filter by property ID
- `userId`: Filter by user ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `includeDeleted`: Include soft-deleted documents (admin only, default: false)

## Storage Adapter

The module uses a storage adapter interface to abstract file storage operations:

```typescript
interface StorageAdapter {
  upload(filePath: string, file: Express.Multer.File): Promise<void>;
  download(filePath: string): Readable;
  delete(filePath: string): Promise<void>;
}
```

The default implementation (`LocalStorageAdapter`) stores files on the local filesystem, but this can be replaced with other implementations (e.g., cloud storage) by implementing the `StorageAdapter` interface.

## Security Considerations

- All routes require authentication
- Document access is restricted based on ownership and user roles
- Filenames are sanitized and randomized to prevent path traversal attacks
- File types are restricted to PDF, JPEG, and PNG
- Maximum file size is limited to 5MB

## Error Handling

The module includes comprehensive error handling for:

- Invalid requests
- Missing files
- Permission issues
- File system errors
- Database errors

Errors are logged using the application's logger and appropriate HTTP status codes are returned.