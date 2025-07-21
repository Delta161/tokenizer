# Remove Legacy Analytics Modules Script
# This script removes the legacy audit, flags, and visit modules after they've been consolidated into the analytics module

# Configuration
$projectRoot = "$PSScriptRoot\.."
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "$projectRoot\backups"
$backupPath = "$backupDir\pre-removal-$timestamp"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Step 1: Initial Confirmation
Write-Host "Remove Legacy Analytics Modules Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "\nThis script will remove the legacy audit, flags, and visit modules." -ForegroundColor Yellow
Write-Host "It will create a backup before making any changes." -ForegroundColor Yellow
Write-Host "\nIMPORTANT: Make sure you have already run the fix-analytics-imports.ps1 script" -ForegroundColor Red
Write-Host "and verified that all tests pass before running this script." -ForegroundColor Red

$confirmation = Read-Host "\nDo you want to proceed? (y/n)"
if ($confirmation -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

# Step 2: Verify Analytics Module
Write-Host "\nStep 2: Verifying analytics module..." -ForegroundColor Cyan
$analyticsModulePath = "$projectRoot\src\modules\analytics"

if (-not (Test-Path $analyticsModulePath)) {
    Write-Host "Error: Analytics module not found at $analyticsModulePath" -ForegroundColor Red
    Write-Host "Please make sure the analytics module exists before removing legacy modules." -ForegroundColor Red
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
    "analytics.visit.controller.ts"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    $filePath = "$analyticsModulePath\$file"
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Error: The following required files are missing from the analytics module:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host " - $file" -ForegroundColor Red
    }
    Write-Host "Please make sure the analytics module is complete before removing legacy modules." -ForegroundColor Red
    exit
}

Write-Host "Analytics module verified." -ForegroundColor Green

# Step 3: Check for Import References
Write-Host "\nStep 3: Checking for legacy import references..." -ForegroundColor Cyan

$legacyImportPatterns = @(
    "from '../audit",
    "from '../flags",
    "from '../visit",
    "from '../../audit",
    "from '../../flags",
    "from '../../visit",
    "from '../../../audit",
    "from '../../../flags",
    "from '../../../visit"
)

$files = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
         Where-Object { $_.FullName -notlike "*\node_modules\*" }

$filesWithLegacyImports = @()

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $hasLegacyImport = $false
    
    foreach ($pattern in $legacyImportPatterns) {
        if ($content.Contains($pattern)) {
            $hasLegacyImport = $true
            break
        }
    }
    
    if ($hasLegacyImport) {
        $filesWithLegacyImports += $file.FullName
    }
}

if ($filesWithLegacyImports.Count -gt 0) {
    Write-Host "Warning: Found files with legacy import references:" -ForegroundColor Yellow
    foreach ($file in $filesWithLegacyImports) {
        Write-Host " - $file" -ForegroundColor Yellow
    }
    
    $proceedAnyway = Read-Host "Legacy import references found. Do you want to proceed anyway? (y/n)"
    if ($proceedAnyway -ne "y") {
        Write-Host "Operation cancelled. Please run the fix-analytics-imports.ps1 script first." -ForegroundColor Red
        exit
    }
}

# Step 4: Create Backup
Write-Host "\nStep 4: Creating backup..." -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath | Out-Null

# Backup src directory
Copy-Item -Path "$projectRoot\src" -Destination "$backupPath\src" -Recurse
Write-Host "Backup created at $backupPath" -ForegroundColor Green

# Step 5: Remove Legacy Modules
Write-Host "\nStep 5: Removing legacy modules..." -ForegroundColor Cyan

$legacyModules = @(
    "$projectRoot\src\modules\audit",
    "$projectRoot\src\modules\flags",
    "$projectRoot\src\modules\visit"
)

foreach ($module in $legacyModules) {
    if (Test-Path $module) {
        Remove-Item -Path $module -Recurse -Force
        Write-Host "Removed $module" -ForegroundColor Green
    } else {
        Write-Host "Module not found: $module" -ForegroundColor Yellow
    }
}

# Step 6: Run TypeScript compiler to check for errors
Write-Host "\nStep 6: Running TypeScript compiler to check for errors..." -ForegroundColor Cyan

try {
    $tscOutput = & npx tsc --noEmit 2>&1
    $tscExitCode = $LASTEXITCODE
    
    if ($tscExitCode -eq 0) {
        Write-Host "TypeScript compilation successful. No type errors found." -ForegroundColor Green
    } else {
        Write-Host "TypeScript compilation failed with errors:" -ForegroundColor Red
        Write-Host $tscOutput -ForegroundColor Red
        
        $restoreBackup = Read-Host "Do you want to restore from backup? (y/n)"
        if ($restoreBackup -eq "y") {
            Write-Host "Restoring from backup..." -ForegroundColor Cyan
            Remove-Item -Path "$projectRoot\src" -Recurse -Force
            Copy-Item -Path "$backupPath\src" -Destination "$projectRoot" -Recurse
            Write-Host "Restored from backup." -ForegroundColor Green
            exit
        }
    }
} catch {
    Write-Host "Error running TypeScript compiler: $_" -ForegroundColor Red
    
    $restoreBackup = Read-Host "Do you want to restore from backup? (y/n)"
    if ($restoreBackup -eq "y") {
        Write-Host "Restoring from backup..." -ForegroundColor Cyan
        Remove-Item -Path "$projectRoot\src" -Recurse -Force
        Copy-Item -Path "$backupPath\src" -Destination "$projectRoot" -Recurse
        Write-Host "Restored from backup." -ForegroundColor Green
        exit
    }
}

# Step 7: Completion
Write-Host "\nLegacy modules removal completed!" -ForegroundColor Cyan
Write-Host "A backup of the project before removal can be found at: $backupPath" -ForegroundColor Green

Write-Host "\nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run tests to ensure everything works correctly" -ForegroundColor Yellow
Write-Host "2. If there are any issues, you can restore from the backup" -ForegroundColor Yellow
Write-Host "3. Update documentation to reflect the new module structure" -ForegroundColor Yellow