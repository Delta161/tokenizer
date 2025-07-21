# Analytics Modules Cleanup Script
# This script automates the cleanup of legacy audit, flags, and visit modules
# that have been merged into the consolidated /src/modules/analytics module.

# Configuration
$projectRoot = "$PSScriptRoot\.."
$modulesPath = "$projectRoot\src\modules"
$legacyModules = @("audit", "flags", "visit")
$analyticsModule = "$modulesPath\analytics"
$backupDir = "$projectRoot\backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$backupDir\pre-analytics-cleanup-$timestamp"
$fullBackupPath = "$backupDir\analytics-full-backup-$timestamp.zip"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Step 1: Initial Confirmation
Write-Host "Analytics Modules Cleanup Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "\nThis script will clean up the following legacy modules:" -ForegroundColor Yellow
foreach ($module in $legacyModules) {
    Write-Host " - $module" -ForegroundColor Yellow
}
Write-Host "\nThese modules have been consolidated into the new analytics module." -ForegroundColor Yellow
Write-Host "\nWARNING: This is a destructive operation. A backup will be created, but proceed with caution." -ForegroundColor Red

$confirmation = Read-Host "\nDo you want to proceed? (y/n)"
if ($confirmation -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

# Step 2: Preparation and Verification
Write-Host "\nStep 2: Verifying analytics module..." -ForegroundColor Cyan

# Check if analytics module exists
if (-not (Test-Path $analyticsModule)) {
    Write-Host "Error: Analytics module not found at $analyticsModule" -ForegroundColor Red
    Write-Host "Please ensure the analytics module has been created before running this script." -ForegroundColor Red
    exit
}

# Check for required files in analytics module
$requiredFiles = @(
    "index.ts",
    "analytics.module.ts",
    "analytics.routes.ts",
    "analytics.audit.service.ts",
    "analytics.audit.controller.ts",
    "analytics.flags.service.ts",
    "analytics.flags.controller.ts",
    "analytics.visit.service.ts",
    "analytics.visit.controller.ts",
    "analytics.visit.analytics.service.ts",
    "analytics.visit.analytics.controller.ts"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    $filePath = "$analyticsModule\$file"
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Error: The following required files are missing from the analytics module:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host " - $file" -ForegroundColor Red
    }
    Write-Host "Please ensure all required files have been created before running this script." -ForegroundColor Red
    exit
}

Write-Host "Analytics module verification successful." -ForegroundColor Green

# Step 3: Create Full Backup
Write-Host "\nStep 3: Creating full project backup..." -ForegroundColor Cyan

try {
    Compress-Archive -Path "$projectRoot\*" -DestinationPath $fullBackupPath -Force
    Write-Host "Full backup created at $fullBackupPath" -ForegroundColor Green
} catch {
    Write-Host "Error creating full backup: $_" -ForegroundColor Red
    $continueWithoutFullBackup = Read-Host "Do you want to continue without a full backup? (y/n)"
    if ($continueWithoutFullBackup -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit
    }
}

# Step 4: Create Module-Specific Backups
Write-Host "\nStep 4: Creating module-specific backups..." -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath | Out-Null

foreach ($module in $legacyModules) {
    $modulePath = "$modulesPath\$module"
    if (Test-Path $modulePath) {
        $moduleBackupPath = "$backupPath\$module"
        Copy-Item -Path $modulePath -Destination $moduleBackupPath -Recurse
        Write-Host "Backed up $module module to $moduleBackupPath" -ForegroundColor Green
    } else {
        Write-Host "Warning: $module module not found at $modulePath" -ForegroundColor Yellow
    }
}

# Step 5: Update Import References
Write-Host "\nStep 5: Updating import references..." -ForegroundColor Cyan

# Define import patterns to replace
$importPatterns = @(
    # Module imports
    @{ Pattern = "from '../audit'"; Replacement = "from '../analytics'" },
    @{ Pattern = "from '../flags'"; Replacement = "from '../analytics'" },
    @{ Pattern = "from '../visit'"; Replacement = "from '../analytics'" },
    @{ Pattern = "from '../../audit'"; Replacement = "from '../../analytics'" },
    @{ Pattern = "from '../../flags'"; Replacement = "from '../../analytics'" },
    @{ Pattern = "from '../../visit'"; Replacement = "from '../../analytics'" },
    
    # Specific file imports
    @{ Pattern = "from '../audit/audit.service'"; Replacement = "from '../analytics/analytics.audit.service'" },
    @{ Pattern = "from '../audit/audit.controller'"; Replacement = "from '../analytics/analytics.audit.controller'" },
    @{ Pattern = "from '../audit/audit.types'"; Replacement = "from '../analytics/analytics.audit.types'" },
    @{ Pattern = "from '../audit/audit.validators'"; Replacement = "from '../analytics/analytics.audit.validators'" },
    
    @{ Pattern = "from '../flags/flags.service'"; Replacement = "from '../analytics/analytics.flags.service'" },
    @{ Pattern = "from '../flags/flags.controller'"; Replacement = "from '../analytics/analytics.flags.controller'" },
    @{ Pattern = "from '../flags/flags.types'"; Replacement = "from '../analytics/analytics.flags.types'" },
    @{ Pattern = "from '../flags/flags.validators'"; Replacement = "from '../analytics/analytics.flags.validators'" },
    
    @{ Pattern = "from '../visit/visit.service'"; Replacement = "from '../analytics/analytics.visit.service'" },
    @{ Pattern = "from '../visit/visit.controller'"; Replacement = "from '../analytics/analytics.visit.controller'" },
    @{ Pattern = "from '../visit/visit.types'"; Replacement = "from '../analytics/analytics.visit.types'" },
    @{ Pattern = "from '../visit/visit.validators'"; Replacement = "from '../analytics/analytics.visit.validators'" },
    @{ Pattern = "from '../visit/visit.analytics.service'"; Replacement = "from '../analytics/analytics.visit.analytics.service'" },
    @{ Pattern = "from '../visit/visit.analytics.controller'"; Replacement = "from '../analytics/analytics.visit.analytics.controller'" },
    @{ Pattern = "from '../visit/visit.analytics.types'"; Replacement = "from '../analytics/analytics.visit.analytics.types'" },
    @{ Pattern = "from '../visit/visit.analytics.validators'"; Replacement = "from '../analytics/analytics.visit.analytics.validators'" },
    
    # Two-level deep imports
    @{ Pattern = "from '../../audit/audit.service'"; Replacement = "from '../../analytics/analytics.audit.service'" },
    @{ Pattern = "from '../../audit/audit.controller'"; Replacement = "from '../../analytics/analytics.audit.controller'" },
    @{ Pattern = "from '../../audit/audit.types'"; Replacement = "from '../../analytics/analytics.audit.types'" },
    @{ Pattern = "from '../../audit/audit.validators'"; Replacement = "from '../../analytics/analytics.audit.validators'" },
    
    @{ Pattern = "from '../../flags/flags.service'"; Replacement = "from '../../analytics/analytics.flags.service'" },
    @{ Pattern = "from '../../flags/flags.controller'"; Replacement = "from '../../analytics/analytics.flags.controller'" },
    @{ Pattern = "from '../../flags/flags.types'"; Replacement = "from '../../analytics/analytics.flags.types'" },
    @{ Pattern = "from '../../flags/flags.validators'"; Replacement = "from '../../analytics/analytics.flags.validators'" },
    
    @{ Pattern = "from '../../visit/visit.service'"; Replacement = "from '../../analytics/analytics.visit.service'" },
    @{ Pattern = "from '../../visit/visit.controller'"; Replacement = "from '../../analytics/analytics.visit.controller'" },
    @{ Pattern = "from '../../visit/visit.types'"; Replacement = "from '../../analytics/analytics.visit.types'" },
    @{ Pattern = "from '../../visit/visit.validators'"; Replacement = "from '../../analytics/analytics.visit.validators'" },
    @{ Pattern = "from '../../visit/visit.analytics.service'"; Replacement = "from '../../analytics/analytics.visit.analytics.service'" },
    @{ Pattern = "from '../../visit/visit.analytics.controller'"; Replacement = "from '../../analytics/analytics.visit.analytics.controller'" },
    @{ Pattern = "from '../../visit/visit.analytics.types'"; Replacement = "from '../../analytics/analytics.visit.analytics.types'" },
    @{ Pattern = "from '../../visit/visit.analytics.validators'"; Replacement = "from '../../analytics/analytics.visit.analytics.validators'" },
    
    # Require statements
    @{ Pattern = "require('../audit'"; Replacement = "require('../analytics'" },
    @{ Pattern = "require('../flags'"; Replacement = "require('../analytics'" },
    @{ Pattern = "require('../visit'"; Replacement = "require('../analytics'" },
    @{ Pattern = "require('../../audit'"; Replacement = "require('../../analytics'" },
    @{ Pattern = "require('../../flags'"; Replacement = "require('../../analytics'" },
    @{ Pattern = "require('../../visit'"; Replacement = "require('../../analytics'" }
)

# Get all TypeScript and JavaScript files in the src directory
$files = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
         Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\$backupPath\*" }

$updatedFiles = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $fileUpdated = $false
    
    foreach ($pattern in $importPatterns) {
        if ($content -match $pattern.Pattern) {
            $content = $content -replace $pattern.Pattern, $pattern.Replacement
            $fileUpdated = $true
        }
    }
    
    if ($fileUpdated) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated imports in $($file.FullName)" -ForegroundColor Green
        $updatedFiles++
    }
}

Write-Host "Updated imports in $updatedFiles files." -ForegroundColor Green

# Step 6: Update README.md files
Write-Host "\nStep 6: Updating README.md files..." -ForegroundColor Cyan

$readmePath = "$projectRoot\README.md"
if (Test-Path $readmePath) {
    $readme = Get-Content -Path $readmePath -Raw
    $readmeUpdated = $false
    
    foreach ($module in $legacyModules) {
        if ($readme -match "/src/modules/$module") {
            $readme = $readme -replace "/src/modules/$module", "/src/modules/analytics"
            $readmeUpdated = $true
        }
    }
    
    if ($readmeUpdated) {
        Set-Content -Path $readmePath -Value $readme
        Write-Host "Updated references in README.md" -ForegroundColor Green
    }
}

# Step 7: Final Validation
Write-Host "\nStep 7: Performing final validation..." -ForegroundColor Cyan

# Check for any remaining references to legacy modules
$remainingReferences = @()

foreach ($module in $legacyModules) {
    $modulePattern = "\b$module\b"
    $filesWithReferences = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
                          Where-Object { $_.FullName -notlike "*\node_modules\*" } | 
                          Select-String -Pattern $modulePattern -List | 
                          Select-Object -ExpandProperty Path
    
    foreach ($file in $filesWithReferences) {
        $remainingReferences += "$file contains references to $module module"
    }
}

if ($remainingReferences.Count -gt 0) {
    Write-Host "\nWarning: Found remaining references to legacy modules:" -ForegroundColor Yellow
    foreach ($reference in $remainingReferences) {
        Write-Host " - $reference" -ForegroundColor Yellow
    }
    Write-Host "\nYou may need to manually update these references." -ForegroundColor Yellow
} else {
    Write-Host "No remaining references to legacy modules found." -ForegroundColor Green
}

# Step 8: Remove Legacy Modules
Write-Host "\nStep 8: Removing legacy modules..." -ForegroundColor Cyan

$confirmation = Read-Host "Do you want to remove the legacy modules? (y/n)"
if ($confirmation -eq "y") {
    foreach ($module in $legacyModules) {
        $modulePath = "$modulesPath\$module"
        if (Test-Path $modulePath) {
            Remove-Item -Path $modulePath -Recurse -Force
            Write-Host "Removed $module module" -ForegroundColor Green
        } else {
            Write-Host "Warning: $module module not found at $modulePath" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Legacy modules were not removed." -ForegroundColor Yellow
}

# Step 9: Completion
Write-Host "\nAnalytics modules cleanup completed!" -ForegroundColor Cyan
Write-Host "A backup of the legacy modules can be found at: $backupPath" -ForegroundColor Green
Write-Host "A full project backup can be found at: $fullBackupPath" -ForegroundColor Green
Write-Host "\nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run tests to ensure everything works correctly" -ForegroundColor Yellow
Write-Host "2. Update any documentation that references the old module structure" -ForegroundColor Yellow
Write-Host "3. Commit the changes to version control" -ForegroundColor Yellow