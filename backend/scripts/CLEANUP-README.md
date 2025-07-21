# Legacy Modules Cleanup

This document outlines the process for cleaning up legacy modules that have been merged into consolidated modules:

1. Legacy `user`, `auth`, and `kyc` modules merged into `/src/modules/accounts`
2. Legacy `audit`, `flags`, and `visit` modules merged into `/src/modules/analytics`

## Background

As part of our backend refactoring, we've consolidated related modules into cohesive modules:

### Accounts Module

The following modules have been consolidated into a single `accounts` module:

- `/src/modules/auth` - Authentication functionality
- `/src/modules/user` - User management functionality
- `/src/modules/kyc` - Know Your Customer verification functionality

All functionality from these modules has been migrated to `/src/modules/accounts` with improved architecture and better separation of concerns.

### Analytics Module

The following modules have been consolidated into a single `analytics` module:

- `/src/modules/audit` - Audit logging functionality
- `/src/modules/flags` - Feature flags functionality
- `/src/modules/visit` - Visit tracking and analytics functionality

All functionality from these modules has been migrated to `/src/modules/analytics` with improved architecture and better separation of concerns.

## Cleanup Plan

The cleanup process involves the following steps:

1. **Initial Confirmation**
   - Confirm the user wants to proceed with the cleanup

2. **Full Backup**
   - Create a complete backup of the project before making any changes

3. **Preparation and Verification**
   - Verify that all functionality has been migrated to the accounts module
   - Ensure the accounts module contains all necessary components
   - Run tests to ensure everything works before making changes

4. **Backup of Legacy Modules**
   - Create a specific backup of just the legacy modules before removal

5. **Delete Legacy Module Folders**
   - Remove the legacy module folders

6. **Update Imports**
   - Update all imports in other modules to reference the new accounts module
   - Replace patterns like `from '../auth'` with `from '../accounts'`
   - Handle specific file imports with proper mapping to the new structure

7. **Clean Up Tests**
   - Update imports in test files

8. **Update Configuration and Documentation**
   - Update README files and other documentation
   - Check database migrations for references to old modules
   - Update package.json scripts if they reference old modules

9. **Final Validation**
   - Check for any remaining references to legacy modules
   - Run tests again to ensure everything works after the changes

## Execution Instructions

### Prerequisites

- Ensure you have a backup of your codebase
- Make sure all tests pass with the current structure

### Running the Cleanup Scripts

1. Open PowerShell in the backend directory
2. Run the appropriate cleanup script:

#### For Accounts Module:

```powershell
./scripts/execute-cleanup-plan.ps1
```

#### For Analytics Module:

```powershell
./scripts/cleanup-analytics-modules.ps1
```

The script will:
- Ask for confirmation before proceeding
- Create a full backup of the project
- Verify the accounts module is properly set up
- Run tests before making changes
- Create a backup of the legacy modules
- Remove the legacy modules
- Update imports in all files
- Check for remaining references
- Run tests again to verify changes

### Post-Cleanup Verification

After running the script, perform the following checks:

1. Start the application and verify core functionality:

```powershell
npm start
```

2. Check for any runtime errors related to missing modules

3. Verify that all features previously provided by the legacy modules still work correctly

## Rollback Procedure

If issues are encountered, you can restore from the backups created by the script:

1. **Restore Legacy Modules Only**:
   - The script creates a backup in the `backups/pre-cleanup-{timestamp}` directory
   - Copy the contents of this directory back to their original locations in `src/modules/`

2. **Full Restore**:
   - The script creates a full backup at `backups/full-backup-{timestamp}.zip`
   - Extract this zip file to restore the entire project

## Import Mapping Details

The script handles various import patterns and maps them to the new structure:

| Old Import | New Import |
|------------|------------|
| `from '../auth'` | `from '../accounts'` |
| `from '../user'` | `from '../accounts'` |
| `from '../kyc'` | `from '../accounts'` |
| `from '../auth/auth.middleware'` | `from '../accounts/middleware/auth.middleware'` |
| `from '../auth/auth.types'` | `from '../accounts/types/auth.types'` |
| `from '../user/user.types'` | `from '../accounts/types/user.types'` |
| `from '../kyc/kyc.middleware'` | `from '../accounts/middleware/kyc.middleware'` |

## Additional Notes

- The script performs a search for any remaining references to legacy modules and reports them
- Manual intervention may be required for complex import patterns not caught by the script
- Update any documentation or diagrams that reference the old module structure
- The script checks database migrations for references to old modules but doesn't modify them as they are historical records
- The script updates package.json scripts if they reference old modules