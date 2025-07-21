# Fix Analytics Imports Script
# This script updates import references from legacy audit, flags, and visit modules to the new analytics module

# Configuration
$projectRoot = "$PSScriptRoot\.."
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "$projectRoot\backups"
$backupPath = "$backupDir\pre-import-fix-$timestamp"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Step 1: Initial Confirmation
Write-Host "Fix Analytics Imports Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host "\nThis script will update import references from legacy modules to the new analytics module." -ForegroundColor Yellow
Write-Host "It will create a backup before making any changes." -ForegroundColor Yellow

$confirmation = Read-Host "\nDo you want to proceed? (y/n)"
if ($confirmation -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

# Step 2: Create Backup
Write-Host "\nStep 2: Creating backup..." -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath | Out-Null

# Backup src directory
Copy-Item -Path "$projectRoot\src" -Destination "$backupPath\src" -Recurse
Write-Host "Backup created at $backupPath" -ForegroundColor Green

# Step 3: Update Import References
Write-Host "\nStep 3: Updating import references..." -ForegroundColor Cyan

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

# Step 4: Check for any remaining references
Write-Host "\nStep 4: Checking for remaining references..." -ForegroundColor Cyan

$legacyModules = @("audit", "flags", "visit")
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

# Step 5: Run TypeScript compiler to check for errors
Write-Host "\nStep 5: Running TypeScript compiler to check for errors..." -ForegroundColor Cyan

try {
    $tscOutput = & npx tsc --noEmit 2>&1
    $tscExitCode = $LASTEXITCODE
    
    if ($tscExitCode -eq 0) {
        Write-Host "TypeScript compilation successful. No type errors found." -ForegroundColor Green
    } else {
        Write-Host "TypeScript compilation failed with errors:" -ForegroundColor Red
        Write-Host $tscOutput -ForegroundColor Red
    }
} catch {
    Write-Host "Error running TypeScript compiler: $_" -ForegroundColor Red
}

# Step 6: Completion
Write-Host "\nImport references update completed!" -ForegroundColor Cyan
Write-Host "A backup of the project before changes can be found at: $backupPath" -ForegroundColor Green

Write-Host "\nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run tests to ensure everything works correctly" -ForegroundColor Yellow
Write-Host "2. If there are any issues, you can restore from the backup" -ForegroundColor Yellow
Write-Host "3. Once everything is working, you can run the full cleanup script to remove the legacy modules" -ForegroundColor Yellow