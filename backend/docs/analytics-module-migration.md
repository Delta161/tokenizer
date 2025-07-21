# Analytics Module Migration and Cleanup Plan

## Overview

This document outlines the migration of the `audit`, `flags`, and `visit` modules into a consolidated `analytics` module, and the subsequent cleanup process.

## Migration Status

### Completed

- ✅ Created consolidated `analytics` module structure
- ✅ Migrated audit functionality to `analytics.audit.*` files
- ✅ Migrated flags functionality to `analytics.flags.*` files
- ✅ Migrated visit functionality to `analytics.visit.*` files
- ✅ Migrated visit analytics functionality to `analytics.visit.analytics.*` files
- ✅ Updated module exports in `analytics/index.ts`
- ✅ Updated route definitions in `analytics.routes.ts`
- ✅ Created module registration in `analytics.module.ts`
- ✅ Registered analytics module in `app.ts`
- ✅ Updated README.md with new module structure

### Pending

- ⬜ Run cleanup script to update import references throughout the codebase
- ⬜ Remove legacy `audit`, `flags`, and `visit` modules
- ⬜ Run tests to verify functionality
- ⬜ Update documentation

## Migration Details

### Module Structure

The new `analytics` module follows a consistent naming convention:

```
src/modules/analytics/
├── analytics.module.ts            # Module registration
├── analytics.routes.ts            # API routes
├── index.ts                       # Exports
├── README.md                      # Documentation
│
├── analytics.audit.controller.ts  # Audit controllers
├── analytics.audit.service.ts     # Audit services
├── analytics.audit.types.ts       # Audit types
├── analytics.audit.validators.ts  # Audit validators
│
├── analytics.flags.controller.ts  # Flags controllers
├── analytics.flags.service.ts     # Flags services
├── analytics.flags.types.ts       # Flags types
├── analytics.flags.validators.ts  # Flags validators
│
├── analytics.visit.controller.ts  # Visit controllers
├── analytics.visit.service.ts     # Visit services
├── analytics.visit.types.ts       # Visit types
├── analytics.visit.validators.ts  # Visit validators
│
├── analytics.visit.analytics.controller.ts  # Visit analytics controllers
├── analytics.visit.analytics.service.ts     # Visit analytics services
├── analytics.visit.analytics.types.ts       # Visit analytics types
└── analytics.visit.analytics.validators.ts  # Visit analytics validators
```

### API Endpoints

The analytics module exposes the following API endpoints:

#### Audit Endpoints

- `GET /api/audit` - Get audit logs
- `POST /api/audit` - Create audit log

#### Flags Endpoints

- `GET /api/flags` - Get all feature flags
- `GET /api/flags/:key` - Get feature flag by key
- `PUT /api/flags/:key` - Update feature flag

#### Visit Endpoints

- `POST /api/visits` - Create a new visit

#### Visit Analytics Endpoints

- `GET /api/analytics/properties/:id/visits` - Get property visit summary
- `GET /api/analytics/clients/:id/visits` - Get client visit breakdown
- `GET /api/analytics/trending` - Get trending properties

## Cleanup Process

### Cleanup Scripts

We've created the following scripts to assist with the cleanup process:

1. `cleanup-analytics-modules.ps1` - Main cleanup script
2. `test-analytics-module.ps1` - Test script to verify functionality

### Running the Cleanup

To run the cleanup process:

1. Ensure you have committed or backed up your current work
2. Open a PowerShell terminal in the `backend` directory
3. Run the cleanup script:

```powershell
./scripts/cleanup-analytics-modules.ps1
```

4. Follow the prompts to confirm actions
5. After completion, run the test script:

```powershell
./scripts/test-analytics-module.ps1
```

6. Verify that all tests pass

### Cleanup Steps

The cleanup script performs the following steps:

1. Creates backups of the original modules and a full project backup
2. Verifies that the new `analytics` module contains all required files
3. Updates import references throughout the codebase to point to the new module
4. Updates README.md files to reflect the new structure
5. Performs validation to check for any remaining references
6. Optionally removes the legacy modules

## Verification

After running the cleanup script, you should verify:

1. All tests pass
2. The application starts correctly
3. All analytics-related functionality works as expected:
   - Audit logging
   - Feature flags
   - Visit tracking
   - Visit analytics

## Rollback Procedure

If necessary, you can revert to the pre-cleanup state by restoring from the backup:

```powershell
# Extract the full backup (replace with your actual backup path)  
Expand-Archive -Path "./backups/analytics-full-backup-YYYYMMDD-HHMMSS.zip" -DestinationPath "./" -Force
```

## Next Steps

After successful cleanup:

1. Commit the changes to version control
2. Update any documentation that references the old module structure
3. Inform the team about the completed migration