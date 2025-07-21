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
import { AnalyticsAuditService } from '../analytics/index.js';
import { ActionType } from '@prisma/client';

// Initialize the audit service
const auditService = new AnalyticsAuditService();

// Example: Record a document upload action
await auditService.createAuditLog({
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
GET /api/audit
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
GET /api/audit?actionType=PROPERTY_CREATED&fromDate=2025-01-01T00:00:00Z&limit=10
```

### Retrieving Specific Audit Log

```
GET /api/audit/:id
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
}
```

## Developer Guide

### Integration Best Practices

1. **Always include relevant metadata**: The `metadata` field is flexible and allows you to store any JSON-serializable data that provides context about the action.

2. **Use consistent entity types**: Maintain a consistent naming convention for `entityType` values (e.g., 'User', 'Property', 'Investment').

3. **Error handling**: The `createAuditLog` function is designed to fail silently to prevent audit logging issues from breaking core functionality. However, you should still monitor for errors in production.

4. **Performance considerations**: Audit logging happens asynchronously but can still impact performance. Consider using a message queue for high-volume scenarios.

### Extending the Audit Module

#### Adding New Action Types

To add a new action type:

1. Update the `ActionType` enum in the Prisma schema
2. Run `npx prisma generate` to update the Prisma client

#### Adding New API Endpoints

To add new API endpoints:

1. Create a new controller method in `audit.controller.ts`
2. Add the route in `audit.routes.ts`
3. Implement any necessary service methods in `audit.service.ts`

### Security Considerations

- All audit log API endpoints require authentication and ADMIN role permissions
- Sensitive data should not be stored in the audit log metadata