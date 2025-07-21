# PrismaClient Consolidation in Accounts Module

## Problem
The accounts module was creating multiple PrismaClient instances across different services and middleware, leading to connection overhead and potential performance issues.

## Solution
We've implemented a centralized approach to PrismaClient usage within the accounts module by:

1. Creating a shared Prisma client utility in `utils/prisma.ts` that imports and re-exports the centralized client from `src/prisma/client.ts`
2. Updating all services and middleware to use this shared client
3. Removing redundant PrismaClient instantiations

## Changes Made

### New Files
- Created `src/modules/accounts/utils/prisma.ts` to provide a shared client
- Updated `src/modules/accounts/utils/index.ts` to export the shared client

### Modified Files
- `services/auth.service.ts`: Now uses the shared client
- `services/user.service.ts`: Now uses the shared client
- `services/kyc.service.ts`: Now uses the shared client
- `services/token.service.ts`: Now uses the shared client
- `middleware/kyc.middleware.ts`: Now uses the shared client
- `strategies/azure.strategy.ts`: Now uses the shared client
- `strategies/google.strategy.ts`: Now uses the shared client
- `index.ts`: Removed prisma parameter from module initialization functions

## Benefits

1. **Reduced Connection Overhead**: A single PrismaClient instance means fewer database connections
2. **Consistent Connection Pool**: All queries from the accounts module will use the same connection pool
3. **Simplified Testing**: Easier to mock a single client instance for testing
4. **Better Resource Management**: Prevents potential resource leaks from multiple client instances

## Usage

To use the shared Prisma client in any accounts module file:

```typescript
import { prisma } from '../utils/prisma';
```

Or if importing from another module:

```typescript
import { prisma } from '@modules/accounts/utils/prisma';
```
