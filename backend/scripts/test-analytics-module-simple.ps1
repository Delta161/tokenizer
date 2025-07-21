# Simple Analytics Module Test Script

# Configuration
$projectRoot = "$PSScriptRoot\.."

Write-Host "Analytics Module Test Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Step 1: Check if analytics module exists
Write-Host "Step 1: Verifying analytics module exists..." -ForegroundColor Cyan
$analyticsModulePath = "$projectRoot\src\modules\analytics"

if (-not (Test-Path $analyticsModulePath)) {
    Write-Host "Error: Analytics module not found at $analyticsModulePath" -ForegroundColor Red
    exit 1
}

Write-Host "Analytics module found at $analyticsModulePath" -ForegroundColor Green

# Step 2: Check for required files
Write-Host "Step 2: Checking for required files..." -ForegroundColor Cyan

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
} else {
    Write-Host "All required files found in the analytics module." -ForegroundColor Green
}

# Step 3: Check for legacy modules
Write-Host "Step 3: Checking for legacy modules..." -ForegroundColor Cyan

$legacyModules = @("audit", "flags", "visit")
$modulesPath = "$projectRoot\src\modules"

$existingLegacyModules = @()
foreach ($module in $legacyModules) {
    $modulePath = "$modulesPath\$module"
    if (Test-Path $modulePath) {
        $existingLegacyModules += $module
    }
}

if ($existingLegacyModules.Count -gt 0) {
    Write-Host "Warning: The following legacy modules still exist:" -ForegroundColor Yellow
    foreach ($module in $existingLegacyModules) {
        Write-Host " - $module" -ForegroundColor Yellow
    }
} else {
    Write-Host "No legacy modules found. Cleanup was successful." -ForegroundColor Green
}

# Step 4: Check for import references
Write-Host "Step 4: Checking for legacy import references..." -ForegroundColor Cyan

$legacyImportPatterns = @(
    "from '../audit",
    "from '../flags",
    "from '../visit",
    "from '../../audit",
    "from '../../flags",
    "from '../../visit"
)

$files = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
         Where-Object { $_.FullName -notlike "*\node_modules\*" }

$filesWithLegacyImports = @()

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $hasLegacyImport = $false
    
    foreach ($pattern in $legacyImportPatterns) {
        if ($content -match $pattern) {
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
} else {
    Write-Host "No legacy import references found. Import updates were successful." -ForegroundColor Green
}

# Summary
Write-Host "Analytics Module Test Summary" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "Module Structure:" -ForegroundColor Yellow
if ($missingFiles.Count -eq 0) {
    Write-Host " - All required files present: ✓" -ForegroundColor Green
} else {
    Write-Host " - Missing files: ✗" -ForegroundColor Red
}

Write-Host "Legacy Modules:" -ForegroundColor Yellow
if ($existingLegacyModules.Count -eq 0) {
    Write-Host " - All legacy modules removed: ✓" -ForegroundColor Green
} else {
    Write-Host " - Legacy modules still exist: ✗" -ForegroundColor Red
}

Write-Host "Import References:" -ForegroundColor Yellow
if ($filesWithLegacyImports.Count -eq 0) {
    Write-Host " - All import references updated: ✓" -ForegroundColor Green
} else {
    Write-Host " - Legacy import references found: ✗" -ForegroundColor Red
}

# Final message
Write-Host "Test script completed." -ForegroundColor Cyan
if ($missingFiles.Count -eq 0 -and $existingLegacyModules.Count -eq 0 -and $filesWithLegacyImports.Count -eq 0) {
    Write-Host "All checks passed! The analytics module appears to be working correctly." -ForegroundColor Green
} else {
    Write-Host "Some checks failed. Please review the issues above." -ForegroundColor Yellow
}