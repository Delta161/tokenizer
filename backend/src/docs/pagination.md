# Standardized Pagination System

This document describes the standardized pagination system implemented in the Tokenizer backend application. The system provides a consistent approach to pagination across all API endpoints.

## Overview

The pagination system consists of:

1. **Utility Functions** - Located in `src/utils/pagination.ts`
2. **Middleware** - Located in `src/middleware/pagination.ts`
3. **Type Definitions** - Located in `src/types/pagination.types.ts` (and also in `src/utils/pagination.ts`)

## Response Format

All paginated endpoints return responses in the following format:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 42,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Utility Functions

### `getPaginationOptions(req: Request): PaginationOptions`

Extracts pagination parameters from the request query and returns standardized pagination options.

```typescript
const { page, limit, skip } = getPaginationOptions(req);
```

### `getSkipValue(page: number, limit: number): number`

Calculates the skip value for database queries based on page and limit.

```typescript
const skip = getSkipValue(page, limit);
```

### `createPaginationResult<T>(data: T[], total: number, options: PaginationOptions): PaginationResult<T>`

Creates a standardized pagination result object.

```typescript
const result = createPaginationResult(items, total, { page, limit, skip });
```

### `calculatePaginationMeta(page: number, limit: number, totalItems: number): PaginationMeta`

Calculates pagination metadata.

```typescript
const meta = calculatePaginationMeta(page, limit, totalItems);
```

## Middleware

### `paginationMiddleware(req: Request, res: Response, next: NextFunction): void`

Middleware that parses and validates pagination parameters from the request query and attaches them to the request object.

```typescript
router.get('/items', paginationMiddleware, controller.getItems);
```

Inside your controller, you can access the pagination parameters:

```typescript
const { page, limit, skip } = req.pagination!;
```

## Type Definitions

### `PaginationParams`

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}
```

### `SortingParams`

```typescript
interface SortingParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### `PaginationOptions`

```typescript
interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}
```

### `PaginationMeta`

```typescript
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### `PaginationResult<T>`

```typescript
interface PaginationResult<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  error?: string;
  message?: string;
}
```

## Usage Examples

### Using the Pagination Middleware

```typescript
// In your router setup
router.get('/items', paginationMiddleware, controller.getItems);

// In your controller
async getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = req.pagination!;
    
    // Get items with pagination
    const { items, total } = await this.service.getItems({
      page,
      limit,
      // other parameters
    });
    
    // Create standardized pagination result
    const result = createPaginationResult(items, total, { page, limit, skip });
    
    // Return response
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
```

### Using Zod for Validation

```typescript
async getItems(req: Request, res: Response, next: NextFunction) {
  try {
    // Define query schema with Zod
    const querySchema = z.object({
      page: z.coerce.number().int().positive().optional().default(PAGINATION.DEFAULT_PAGE),
      limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
      // other parameters
    });
    
    // Validate query parameters
    const validatedQuery = querySchema.parse(req.query);
    const { page, limit } = validatedQuery;
    
    // Calculate skip value
    const skip = getSkipValue(page, limit);
    
    // Get items with pagination
    const { items, total } = await this.service.getItems({
      page,
      limit,
      // other parameters
    });
    
    // Create standardized pagination result
    const result = createPaginationResult(items, total, { page, limit, skip });
    
    // Return response
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
```

### In a Service Layer

```typescript
async getItems(options: {
  page: number;
  limit: number;
  // other parameters
}) {
  const { page, limit } = options;
  const skip = getSkipValue(page, limit);
  
  // Build query parameters
  // ...
  
  // Execute queries in parallel for better performance
  const [items, total] = await Promise.all([
    this.prisma.item.findMany({
      // where, orderBy, etc.
      skip,
      take: limit,
    }),
    this.prisma.item.count({
      // where
    }),
  ]);
  
  return { items, total };
}
```

## Configuration

Pagination defaults are defined in `src/config/constants.ts`:

```typescript
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
```

## Best Practices

1. **Use Parallel Queries** - Execute the data query and count query in parallel for better performance.
2. **Validate Input** - Always validate and sanitize pagination parameters.
3. **Consistent Response Format** - Always use `createPaginationResult` to ensure a consistent response format.
4. **Default Values** - Use the constants from `PAGINATION` for default values.
5. **Max Limit** - Enforce the maximum limit to prevent excessive database load.