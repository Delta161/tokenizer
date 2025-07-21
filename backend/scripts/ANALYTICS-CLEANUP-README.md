# Analytics Module Cleanup Guide

## Overview

This guide explains the process of cleaning up the legacy `audit`, `flags`, and `visit` modules after their functionality has been consolidated into the new `analytics` module.

## Background

As part of our modular architecture refactoring, we've consolidated several related functionalities into cohesive modules. The `analytics` module now contains all functionality previously found in:

- `/src/modules/audit` - Audit logging functionality
- `/src/modules/flags` - Feature flags functionality
- `/src/modules/visit` - Visit tracking and analytics functionality

## Cleanup Process

We've created an automated script to handle the cleanup process. The script performs the following tasks:

1. Creates backups of the original modules and a full project backup
2. Verifies that the new `analytics` module contains all required files
3. Updates import references throughout the codebase to point to the new module
4. Updates README.md files to reflect the new structure
5. Performs validation to check for any remaining references
6. Optionally removes the legacy modules

## Running the Cleanup Script

To run the cleanup script, follow these steps:

1. Ensure you have committed or backed up your current work
2. Open a PowerShell terminal in the `backend` directory
3. Run the cleanup script:

```powershell
./scripts/cleanup-analytics-modules.ps1
```

4. Follow the prompts to confirm actions
5. After completion, run tests to ensure everything works correctly

## Manual Verification

After running the script, you should manually verify:

1. All tests pass
2. The application starts correctly
3. All analytics-related functionality works as expected:
   - Audit logging
   - Feature flags
   - Visit tracking
   - Visit analytics

## Troubleshooting

If you encounter issues after running the cleanup script:

1. Check the backup directory (`/backups`) for the pre-cleanup state
2. Review any warnings or errors reported by the script
3. Check for any remaining references to the old modules that might need manual updating

## Reverting Changes

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