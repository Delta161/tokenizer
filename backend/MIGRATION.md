# Backend Module Migration Guide

## Overview

This document outlines the migration process from the old module structure (`backend/modules/`) to the new flattened structure (`backend/src/modules/`). The migration aims to improve code organization, maintainability, and developer experience.

## Migration Status

**Status: Complete** ✅

All modules have been successfully migrated from the old structure to the new structure.

## Directory Structure

### Old Structure

```
backend/
  modules/
    module-name/
      controllers/
        module.controller.js
      services/
        module.service.js
      types/
        module.types.js
      validators/
        module.validator.js
      index.js
```

### New Structure

```
backend/src/
  modules/
    module-name/
      module.controller.ts
      module.service.ts
      module.types.ts
      module.validation.ts
      module.routes.ts
      index.ts
```

## Migration Process

The migration was completed using the following steps:

1. Created the new directory structure in `backend/src/`
2. Migrated each module one by one, converting JavaScript files to TypeScript where applicable
3. Updated import paths in all files to reference the new structure
4. Added TypeScript type definitions
5. Updated the application entry points to use the new structure
6. Verified functionality through testing

## Running the Application

### Old Structure (Legacy)

```bash
npm run dev       # Runs the old structure using server.js
npm run start     # Runs the old structure in production mode
```

### New Structure

```bash
npm run dev:new   # Runs the new structure in development mode with hot reloading
npm run start:new # Runs the new structure in production mode
```

## Cleanup Process

After verifying that the new structure works correctly, you can clean up the old structure using the provided scripts:

```bash
# Step 1: Run the cleanup script to verify migration and create a backup
node scripts/cleanup-old-modules.js

# Step 2: After verification, remove the old modules directory
node scripts/remove-old-modules.js
```

## Import Path Updates

All import paths referencing the old structure have been updated to use the new structure. For example:

```javascript
// Old import
import { authService } from './modules/auth/services/auth.service.js';

// New import
import { authService } from './src/modules/accounts/services/auth.service.js';
```

## Future Development

All new modules and features should be added to the new structure in `backend/src/modules/`. The old structure in `backend/modules/` is deprecated and will be removed once all teams have transitioned to the new structure.

## Troubleshooting

If you encounter any issues with the new structure, please check the following:

1. Ensure all import paths are correctly updated
2. Verify that all required files have been migrated
3. Check for any TypeScript type errors
4. Ensure the application is being run with the correct script

If issues persist, you can temporarily revert to the old structure while troubleshooting.