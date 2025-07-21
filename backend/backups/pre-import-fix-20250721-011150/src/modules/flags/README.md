# Feature Flags Module

## Overview

The Feature Flags module provides a simple way to toggle features on and off without deploying new code. This is useful for:

- Gradual rollouts of new features
- A/B testing
- Canary releases
- Emergency feature disabling

## Features

- Simple boolean flags with descriptive metadata
- In-memory caching for performance
- Admin API for managing flags
- Client API for reading flags
- Easy integration with other modules

## API Endpoints

### Admin Endpoints (Requires ADMIN role)

- `GET /admin/flags` - List all feature flags
- `PATCH /admin/flags/:key` - Update a feature flag

### Client Endpoints (Requires Authentication)

- `GET /flags` - List all feature flags

## Data Model

```prisma
model FeatureFlag {
  key         String   @id                // unique flag key
  enabled     Boolean  @default(false)    // on/off
  description String?                     // human-friendly
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Usage

### Integration

In your `app.ts` file:

```typescript
import { flagsRouter, initFlagsModule } from './modules/flags';

// Initialize the module
initFlagsModule();

// Mount the routes
app.use('/api', flagsRouter);
```

### Using Feature Flags in Code

```typescript
import { flagsService } from './modules/flags';

async function myFunction() {
  const isFeatureEnabled = await flagsService.getFlag('MY_FEATURE');
  
  if (isFeatureEnabled) {
    // New implementation
  } else {
    // Old implementation
  }
}
```

## Admin Operations

### Creating/Updating a Flag

```http
PATCH /api/admin/flags/NEW_FEATURE
Content-Type: application/json

{
  "enabled": true
}
```

### Listing All Flags

```http
GET /api/admin/flags
```

## Security

- All admin endpoints are secured with authentication and ADMIN role requirements
- Client endpoints require authentication