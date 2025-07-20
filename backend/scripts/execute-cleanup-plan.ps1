# Legacy Modules Cleanup Script
# This script automates the cleanup of legacy user, auth, and kyc modules
# that have been merged into the consolidated /src/modules/accounts module.

# Configuration
$projectRoot = "$PSScriptRoot\.."
$modulesPath = "$projectRoot\src\modules"
$legacyModules = @("auth", "user", "kyc")
$accountsModule = "$modulesPath\accounts"
$backupDir = "$projectRoot\backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$backupDir\pre-cleanup-$timestamp"
$fullBackupPath = "$backupDir\full-backup-$timestamp.zip"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Created backup directory: $backupDir" -ForegroundColor Green
}

# Function to test if npm is available
function Test-Npm {
    try {
        npm --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to run tests
function Run-Tests {
    param (
        [string]$message
    )
    
    Write-Host "$message" -ForegroundColor Cyan
    
    if (Test-Npm) {
        try {
            Set-Location $projectRoot
            npm test
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Tests failed!" -ForegroundColor Red
                return $false
            } else {
                Write-Host "Tests passed!" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "Error running tests: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "npm not available, skipping tests" -ForegroundColor Yellow
        return $true  # Continue anyway
    }
}

# Initial confirmation
Write-Host "\nLegacy Modules Cleanup Script" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "This script will remove the following legacy modules:" -ForegroundColor Yellow
foreach ($module in $legacyModules) {
    Write-Host " - $module" -ForegroundColor Yellow
}
Write-Host "\nThese modules have been consolidated into the accounts module." -ForegroundColor Yellow
Write-Host "A backup will be created before any changes are made." -ForegroundColor Yellow

$confirmation = Read-Host "Do you want to proceed? (y/n)"
if ($confirmation -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

# Step 1: Full Backup
Write-Host "\nStep 1: Creating full project backup..." -ForegroundColor Cyan
try {
    Compress-Archive -Path $projectRoot -DestinationPath $fullBackupPath -Force
    Write-Host "Full backup created at: $fullBackupPath" -ForegroundColor Green
} catch {
    Write-Host "Error creating full backup: $_" -ForegroundColor Red
    $confirmation = Read-Host "Do you want to continue without a full backup? (y/n)"
    if ($confirmation -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit
    }
}

# Step 2: Preparation and Verification
Write-Host "\nStep 2: Verifying accounts module..." -ForegroundColor Cyan

# Check if accounts module exists
if (-not (Test-Path $accountsModule)) {
    Write-Host "Error: Accounts module not found at $accountsModule" -ForegroundColor Red
    Write-Host "Please ensure the accounts module has been created before running this script." -ForegroundColor Red
    exit
}

# Check for required files in accounts module
$requiredFiles = @(
    "index.ts",
    "routes",
    "controllers",
    "services",
    "middleware",
    "validators",
    "types"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    $filePath = "$accountsModule\$file"
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Error: The following required files/directories are missing in the accounts module:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host " - $file" -ForegroundColor Red
    }
    Write-Host "Please ensure all functionality has been migrated before running this script." -ForegroundColor Red
    exit
}

# Run tests before making changes
$testsPass = Run-Tests "Running tests before making changes..."
if (-not $testsPass) {
    $confirmation = Read-Host "Tests failed. Do you want to continue anyway? (y/n)"
    if ($confirmation -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit
    }
}

# Step 3: Backup Legacy Modules
Write-Host "\nStep 3: Creating backup of legacy modules..." -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath | Out-Null

# Backup each legacy module
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

# Step 4: Delete Legacy Module Folders
Write-Host "\nStep 4: Deleting legacy module folders..." -ForegroundColor Cyan

foreach ($module in $legacyModules) {
    $modulePath = "$modulesPath\$module"
    if (Test-Path $modulePath) {
        Remove-Item -Path $modulePath -Recurse -Force
        Write-Host "Deleted $module module" -ForegroundColor Green
    } else {
        Write-Host "Warning: $module module not found at $modulePath" -ForegroundColor Yellow
    }
}

# Step 5: Update Imports
Write-Host "\nStep 5: Updating imports in other modules..." -ForegroundColor Cyan

# Define replacement patterns
$replacementPatterns = @(
    # Basic module imports
    @{ Pattern = "from '../auth'"; Replacement = "from '../accounts'" },
    @{ Pattern = "from '../user'"; Replacement = "from '../accounts'" },
    @{ Pattern = "from '../kyc'"; Replacement = "from '../accounts'" },
    @{ Pattern = "from '../../auth'"; Replacement = "from '../../accounts'" },
    @{ Pattern = "from '../../user'"; Replacement = "from '../../accounts'" },
    @{ Pattern = "from '../../kyc'"; Replacement = "from '../../accounts'" },
    
    # Specific file imports
    @{ Pattern = "from '../auth/auth.middleware'"; Replacement = "from '../accounts/middleware/auth.middleware'" },
    @{ Pattern = "from '../auth/auth.types'"; Replacement = "from '../accounts/types/auth.types'" },
    @{ Pattern = "from '../auth/strategies'"; Replacement = "from '../accounts/strategies'" },
    @{ Pattern = "from '../user/user.types'"; Replacement = "from '../accounts/types/user.types'" },
    @{ Pattern = "from '../user/user.service'"; Replacement = "from '../accounts/services/user.service'" },
    @{ Pattern = "from '../kyc/kyc.middleware'"; Replacement = "from '../accounts/middleware/kyc.middleware'" },
    @{ Pattern = "from '../kyc/kyc.types'"; Replacement = "from '../accounts/types/kyc.types'" },
    @{ Pattern = "from '../kyc/kyc.service'"; Replacement = "from '../accounts/services/kyc.service'" },
    
    # Deeper imports
    @{ Pattern = "from '../../auth/auth.middleware'"; Replacement = "from '../../accounts/middleware/auth.middleware'" },
    @{ Pattern = "from '../../auth/auth.types'"; Replacement = "from '../../accounts/types/auth.types'" },
    @{ Pattern = "from '../../auth/strategies'"; Replacement = "from '../../accounts/strategies'" },
    @{ Pattern = "from '../../user/user.types'"; Replacement = "from '../../accounts/types/user.types'" },
    @{ Pattern = "from '../../user/user.service'"; Replacement = "from '../../accounts/services/user.service'" },
    @{ Pattern = "from '../../kyc/kyc.middleware'"; Replacement = "from '../../accounts/middleware/kyc.middleware'" },
    @{ Pattern = "from '../../kyc/kyc.types'"; Replacement = "from '../../accounts/types/kyc.types'" },
    @{ Pattern = "from '../../kyc/kyc.service'"; Replacement = "from '../../accounts/services/kyc.service'" },
    
    # Require statements
    @{ Pattern = "require('../auth'"; Replacement = "require('../accounts'" },
    @{ Pattern = "require('../user'"; Replacement = "require('../accounts'" },
    @{ Pattern = "require('../kyc'"; Replacement = "require('../accounts'" },
    @{ Pattern = "require('../../auth'"; Replacement = "require('../../accounts'" },
    @{ Pattern = "require('../../user'"; Replacement = "require('../../accounts'" },
    @{ Pattern = "require('../../kyc'"; Replacement = "require('../../accounts'" }
)

# Get all TypeScript files in the project
$tsFiles = Get-ChildItem -Path "$projectRoot\src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Where-Object { $_.FullName -notlike "*\node_modules\*" }

$updatedFiles = 0
foreach ($file in $tsFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileUpdated = $false
    
    foreach ($pattern in $replacementPatterns) {
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

Write-Host "Updated imports in $updatedFiles files" -ForegroundColor Green

# Step 6: Clean Up Tests
Write-Host "\nStep 6: Updating imports in test files..." -ForegroundColor Cyan

# Get all test files
$testFiles = Get-ChildItem -Path "$projectRoot\tests" -Recurse -Include "*.test.ts", "*.spec.ts", "*.test.js", "*.spec.js" | Where-Object { $_.FullName -notlike "*\node_modules\*" }

$updatedTestFiles = 0
foreach ($file in $testFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $fileUpdated = $false
    
    foreach ($pattern in $replacementPatterns) {
        if ($content -match $pattern.Pattern) {
            $content = $content -replace $pattern.Pattern, $pattern.Replacement
            $fileUpdated = $true
        }
    }
    
    if ($fileUpdated) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated imports in $($file.FullName)" -ForegroundColor Green
        $updatedTestFiles++
    }
}

Write-Host "Updated imports in $updatedTestFiles test files" -ForegroundColor Green

# Step 7: Update Configuration and Documentation
Write-Host "\nStep 7: Updating configuration and documentation..." -ForegroundColor Cyan

# Check package.json for references to old modules
$packageJsonPath = "$projectRoot\package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content -Path $packageJsonPath -Raw
    $packageJsonUpdated = $false
    
    foreach ($module in $legacyModules) {
        if ($packageJson -match $module) {
            $packageJson = $packageJson -replace "src/modules/$module", "src/modules/accounts"
            $packageJsonUpdated = $true
        }
    }
    
    if ($packageJsonUpdated) {
        Set-Content -Path $packageJsonPath -Value $packageJson
        Write-Host "Updated references in package.json" -ForegroundColor Green
    }
}

# Check README.md for references to old modules
$readmePath = "$projectRoot\README.md"
if (Test-Path $readmePath) {
    $readme = Get-Content -Path $readmePath -Raw
    $readmeUpdated = $false
    
    foreach ($module in $legacyModules) {
        if ($readme -match "/src/modules/$module") {
            $readme = $readme -replace "/src/modules/$module", "/src/modules/accounts"
            $readmeUpdated = $true
        }
    }
    
    if ($readmeUpdated) {
        Set-Content -Path $readmePath -Value $readme
        Write-Host "Updated references in README.md" -ForegroundColor Green
    }
}

# Check Prisma migrations for references to old modules
$migrationsPath = "$projectRoot\prisma\migrations"
if (Test-Path $migrationsPath) {
    $migrationFiles = Get-ChildItem -Path $migrationsPath -Recurse -Include "*.sql"
    $migrationsWithReferences = @()
    
    foreach ($file in $migrationFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        $hasReferences = $false
        
        foreach ($module in $legacyModules) {
            if ($content -match $module) {
                $hasReferences = $true
                break
            }
        }
        
        if ($hasReferences) {
            $migrationsWithReferences += $file.FullName
        }
    }
    
    if ($migrationsWithReferences.Count -gt 0) {
        Write-Host "Warning: The following migration files contain references to legacy modules:" -ForegroundColor Yellow
        foreach ($file in $migrationsWithReferences) {
            Write-Host " - $file" -ForegroundColor Yellow
        }
        Write-Host "These are historical records and should not be modified." -ForegroundColor Yellow
    }
}

# Step 8: Final Validation
Write-Host "\nStep 8: Performing final validation..." -ForegroundColor Cyan

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
    Write-Host "Warning: Found remaining references to legacy modules:" -ForegroundColor Yellow
    foreach ($reference in $remainingReferences) {
        Write-Host " - $reference" -ForegroundColor Yellow
    }
    Write-Host "You may need to manually update these references." -ForegroundColor Yellow
} else {
    Write-Host "No remaining references to legacy modules found." -ForegroundColor Green
}

# Run tests after making changes
$testsPass = Run-Tests "Running tests after making changes..."
if (-not $testsPass) {
    Write-Host "Warning: Tests failed after cleanup. You may need to fix the issues manually." -ForegroundColor Yellow
    Write-Host "You can restore from the backup if needed:" -ForegroundColor Yellow
    Write-Host " - Legacy modules backup: $backupPath" -ForegroundColor Yellow
    Write-Host " - Full project backup: $fullBackupPath" -ForegroundColor Yellow
} else {
    Write-Host "\nCleanup completed successfully!" -ForegroundColor Green
    Write-Host "Legacy modules have been removed and imports have been updated." -ForegroundColor Green
    Write-Host "Backups were created at:" -ForegroundColor Green
    Write-Host " - Legacy modules backup: $backupPath" -ForegroundColor Green
    Write-Host " - Full project backup: $fullBackupPath" -ForegroundColor Green
}