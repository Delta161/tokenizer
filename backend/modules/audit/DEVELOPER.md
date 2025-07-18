# Audit Module Developer Guide

## Overview

The Audit Module provides a comprehensive audit logging system for tracking user actions across the Tokenizer platform. This guide explains how to integrate with and extend the audit module in your development work.

## Architecture

The Audit Module follows a clean architecture pattern with the following components:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic for retrieving and processing audit logs
- **Routes**: Define API endpoints and middleware
- **Hooks**: Provide integration points for other modules
- **Types**: Define TypeScript interfaces and types
- **Validators**: Validate incoming request data
- **Mappers**: Transform data between different formats

## Integration Guide

### Recording Audit Logs

To record audit logs from any module, import and use the `createAuditLog` hook:

```typescript
import { createAuditLog } from '../audit/hooks/createAuditLog';
import { ActionType } from '@prisma/client';

// Example usage in a service or controller
async function approveProperty(propertyId: string, userId: string) {
  // Your business logic here
  const property = await prisma.property.update({
    where: { id: propertyId },
    data: { status: 'APPROVED' }
  });
  
  // Record the action in the audit log
  await createAuditLog({
    userId,
    actionType: ActionType.PROPERTY_APPROVED,
    entityType: 'Property',
    entityId: propertyId,
    metadata: { 
      reason: 'All documents verified',
      approvedBy: userId,
      propertyName: property.name
    }
  });
  
  return property;
}
```

### Best Practices

1. **Always include relevant metadata**: The `metadata` field is flexible and allows you to store any JSON-serializable data that provides context about the action.

2. **Use consistent entity types**: Maintain a consistent naming convention for `entityType` values (e.g., 'User', 'Property', 'Investment').

3. **Error handling**: The `createAuditLog` function is designed to fail silently to prevent audit logging issues from breaking core functionality. However, you should still monitor for errors in production.

4. **Performance considerations**: Audit logging happens asynchronously but can still impact performance. Consider using a message queue for high-volume scenarios.

## Extending the Audit Module

### Adding New Action Types

To add a new action type:

1. Update the `ActionType` enum in the Prisma schema:

```prisma
enum ActionType {
  // Existing types...
  NEW_ACTION_TYPE
}
```

2. Run `npx prisma generate` to update the Prisma client

### Adding New API Endpoints

To add new API endpoints:

1. Create a new controller method in `audit.controller.ts`
2. Add the route in `audit.routes.ts`
3. Implement any necessary service methods in `audit.service.ts`

## Testing

The `scripts/test-audit-hook.js` script demonstrates how to use the audit module and can be used as a reference for testing:

```bash
node scripts/test-audit-hook.js
```

## Security Considerations

- All audit log API endpoints require authentication and ADMIN role permissions
- Sensitive data should not be stored in the audit log metadata
- Consider implementing data retention policies for audit logs

## Troubleshooting

### Common Issues

1. **Missing audit logs**: Ensure the `createAuditLog` function is being called with the correct parameters.

2. **Permission errors**: Verify that the user has the ADMIN role when accessing audit log endpoints.

3. **TypeScript errors**: Make sure you're importing the correct types and interfaces from the audit module.

### Debugging

To debug audit log creation, you can add console logging to the `createAuditLog` function or check the database directly:

```sql
SELECT * FROM "AuditLogEntry" ORDER BY "createdAt" DESC LIMIT 10;
```

## API Reference

### `createAuditLog(params: CreateAuditLogParams): Promise<AuditLogEntry | null>`

Creates a new audit log entry.

**Parameters:**

- `userId`: ID of the user who performed the action (optional)
- `actionType`: Type of action from the ActionType enum
- `entityType`: Type of entity affected (e.g., 'Property', 'User')
- `entityId`: ID of the specific entity (optional)
- `metadata`: Additional context as JSON (optional)

**Returns:**

The created audit log entry or null if creation failed.

### GET `/api/audit/logs`

Retrieves audit logs with optional filtering.

**Query Parameters:**

- `userId`: Filter by user ID
- `actionType`: Filter by action type
- `entityType`: Filter by entity type
- `entityId`: Filter by entity ID
- `fromDate`: Filter by date range start (ISO format)
- `toDate`: Filter by date range end (ISO format)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Returns:**

Array of audit log entries matching the filters.

### GET `/api/audit/logs/:id`

Retrieves a specific audit log entry by ID.

**Parameters:**

- `id`: The ID of the audit log entry

**Returns:**

The audit log entry or 404 if not found.