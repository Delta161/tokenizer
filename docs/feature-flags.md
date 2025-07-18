# Feature Flags Module Documentation

## Overview

The Feature Flags module provides a simple way to toggle features on and off without deploying new code. This is useful for:

- Gradual rollouts of new features
- A/B testing
- Canary releases
- Emergency feature disabling

## Architecture

The Feature Flags module follows the project's modular architecture:

```
backend/modules/flags/
├── controllers/
│   └── flags.controller.ts     # HTTP request handlers
├── routes/
│   └── flags.routes.ts         # API route definitions
├── services/
│   └── flags.service.ts        # Business logic and data access
├── types/
│   └── flags.types.ts          # TypeScript interfaces
├── utils/
│   └── validation.ts           # Validation middleware
├── validators/
│   └── flags.validators.ts     # Zod schemas
├── README.md                   # Module documentation
└── index.ts                    # Module exports
```

## Data Model

The Feature Flag model is defined in the Prisma schema:

```prisma
model FeatureFlag {
  key         String   @id                // unique flag key
  enabled     Boolean  @default(false)    // on/off
  description String?                     // human-friendly
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Backend API

### Admin Endpoints (Requires ADMIN role)

- `GET /api/admin/flags` - List all feature flags
- `PATCH /api/admin/flags/:key` - Update a feature flag

### Client Endpoints (Requires Authentication)

- `GET /api/flags` - List all feature flags

## Using Feature Flags in Backend Code

### Import the Service

```javascript
import { flagsService } from './modules/flags/index.js';
```

### Check if a Feature is Enabled

```javascript
async function myFunction() {
  const isFeatureEnabled = await flagsService.getFlag('MY_FEATURE');
  
  if (isFeatureEnabled) {
    // New implementation
  } else {
    // Old implementation
  }
}
```

### Example: Conditional Route

```javascript
import { Router } from 'express';
import { flagsService } from '../flags/index.js';

const router = Router();

router.get('/example', async (req, res, next) => {
  try {
    const isNewFeatureEnabled = await flagsService.getFlag('NEW_FEATURE');
    
    if (isNewFeatureEnabled) {
      // New implementation
      return res.json({ message: 'New feature enabled!' });
    } else {
      // Old implementation
      return res.json({ message: 'Using legacy implementation' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
```

## Using Feature Flags in Frontend Code

### Import the Composable

```javascript
import { useFeatureFlags } from '@/utils/featureFlags';
```

### Use in a Vue Component

```vue
<script setup>
import { onMounted } from 'vue';
import { useFeatureFlags } from '@/utils/featureFlags';

const { 
  isLoading, 
  error, 
  fetchFeatureFlags, 
  isFeatureEnabled,
  isDarkModeEnabled
} = useFeatureFlags();

// Fetch flags when component is mounted
onMounted(() => {
  fetchFeatureFlags();
});
</script>

<template>
  <div v-if="isLoading">Loading feature flags...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <div v-if="isDarkModeEnabled">Dark Mode is enabled!</div>
    <div v-if="isFeatureEnabled('NEW_EXAMPLE_FEATURE')">New Example Feature is enabled!</div>
  </div>
</template>
```

## Best Practices

### Naming Conventions

Feature flag keys should be:

- All uppercase
- Use underscores to separate words
- Be descriptive but concise
- Examples: `NEW_DASHBOARD`, `BETA_FEATURES`, `DARK_MODE`

### Flag Types

Consider using different naming patterns for different types of flags:

- **Feature toggles**: `FEATURE_NEW_DASHBOARD`
- **Operational toggles**: `OPS_MAINTENANCE_MODE`
- **Experiment toggles**: `EXP_BUTTON_COLOR_BLUE`
- **Release toggles**: `RELEASE_V2_API`

### Cleaning Up

Feature flags should be temporary. Once a feature is fully rolled out and stable, the flag should be removed from the codebase.

## Administration

### Seeding Feature Flags

Use the seed script to create initial feature flags:

```bash
node scripts/seed-feature-flags.js
```

### Managing Flags via API

To update a flag via the API:

```bash
curl -X PATCH http://localhost:3000/api/admin/flags/NEW_FEATURE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"enabled": true}'
```

## Examples

### Gradual Rollout

For a gradual rollout, you can create multiple flags for different user segments:

```javascript
// Check if this user should see the new feature
const userId = req.user.id;
const userSegment = userId % 10; // 0-9 for 10% increments
const enableForUserSegment = await flagsService.getFlag(`ROLLOUT_USER_SEGMENT_${userSegment}`);

if (enableForUserSegment) {
  // Show new feature
} else {
  // Show old feature
}
```

### A/B Testing

For A/B testing, you can use a flag to determine which variant to show:

```javascript
const showVariantB = await flagsService.getFlag('AB_TEST_VARIANT_B');

if (showVariantB) {
  // Show variant B
} else {
  // Show variant A (control)
}
```

## Troubleshooting

### Flag Not Working

If a feature flag doesn't seem to be working:

1. Check if the flag exists in the database
2. Verify the flag key spelling (case-sensitive)
3. Check if the flag is enabled
4. Clear the cache if necessary

### Performance Considerations

The `flagsService.getFlag()` method uses in-memory caching to avoid database queries for every check. The cache is automatically invalidated when a flag is updated.

## Future Enhancements

- UI for managing feature flags
- User targeting based on attributes
- Scheduled flag activation/deactivation
- Flag usage analytics