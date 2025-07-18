# Audit Module

The Audit Module provides a comprehensive audit logging system for tracking and recording user actions across the Tokenizer platform. It allows administrators to monitor and review all significant actions performed by users, providing transparency and accountability.

## Features

- Record user actions with detailed metadata
- Filter audit logs by various criteria (user, action type, entity, date range)
- Secure access control (admin-only)
- Easy integration with other modules via hooks

## Usage

### Recording Audit Logs

You can record audit logs from any module using the `createAuditLog` hook:

```typescript
import { createAuditLog } from '../audit/hooks/createAuditLog';
import { ActionType } from '@prisma/client';

// Example: Record a document upload action
await createAuditLog({
  userId: user.id,
  actionType: ActionType.DOCUMENT_UPLOADED,
  entityType: 'Document',
  entityId: document.id,
  metadata: { 
    documentName: document.originalName,
    documentSize: document.size,
    documentType: document.mimeType
  }
});
```

### Retrieving Audit Logs

Administrators can retrieve audit logs through the API:

```
GET /api/audit/logs
```

Supported filters:
- `userId`: Filter by specific user
- `actionType`: Filter by action type (e.g., PROPERTY_CREATED)
- `entityType`: Filter by entity type (e.g., Property, User)
- `entityId`: Filter by specific entity ID
- `fromDate`: Filter by date range (start)
- `toDate`: Filter by date range (end)
- `limit`: Limit number of results
- `offset`: Pagination offset

Example request:
```
GET /api/audit/logs?actionType=PROPERTY_CREATED&fromDate=2025-01-01T00:00:00Z&limit=10
```

### Retrieving Specific Audit Log

```
GET /api/audit/logs/:id
```

## Schema

### AuditLogEntry Model

```prisma
model AuditLogEntry {
  id          String     @id @default(cuid())
  userId      String?    // Optional to allow system-generated entries
  actionType  ActionType
  entityType  String     // e.g. "Property", "Investment", "User"
  entityId    String?    // Optional FK to specific record
  metadata    Json?      // Additional context about the action
  createdAt   DateTime   @default(now())
  user        User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### ActionType Enum

```prisma
enum ActionType {
  PROPERTY_CREATED
  PROPERTY_UPDATED
  PROPERTY_APPROVED
  PROPERTY_REJECTED
  INVESTMENT_CREATED
  INVESTMENT_CONFIRMED
  INVESTMENT_CANCELLED
  USER_CREATED
  USER_UPDATED
  KYC_SUBMITTED
  KYC_APPROVED
  KYC_REJECTED
  TOKEN_DEPLOYED
  WALLET_VERIFIED
  DOCUMENT_UPLOADED
  DOCUMENT_DELETED
}
```

## Security

All audit log endpoints are protected by authentication and require ADMIN role permissions.