# Cleanup Property Module Script
# This script removes the legacy property module after its functionality has been migrated to the projects module

# Set strict mode to catch errors
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Define paths
$rootDir = "$PSScriptRoot/.."
$srcDir = "$rootDir/src"
$modulesDir = "$srcDir/modules"
$propertyModuleDir = "$modulesDir/property"
$appFile = "$srcDir/app.ts"
$backupDir = "$rootDir/backups/property-module-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Function to check if a directory exists
function Test-DirectoryExists {
    param (
        [string]$Path
    )
    
    if (-not (Test-Path -Path $Path -PathType Container)) {
        Write-Error "Directory not found: $Path"
        exit 1
    }
}

# Function to check if a file exists
function Test-FileExists {
    param (
        [string]$Path
    )
    
    if (-not (Test-Path -Path $Path -PathType Leaf)) {
        Write-Error "File not found: $Path"
        exit 1
    }
}

# Function to create a backup of a directory
function Backup-Directory {
    param (
        [string]$SourceDir,
        [string]$BackupDir
    )
    
    Write-Host "Creating backup of $SourceDir to $BackupDir"
    
    # Create backup directory if it doesn't exist
    if (-not (Test-Path -Path $BackupDir -PathType Container)) {
        New-Item -Path $BackupDir -ItemType Directory -Force | Out-Null
    }
    
    # Copy all files from source to backup
    Copy-Item -Path "$SourceDir/*" -Destination $BackupDir -Recurse -Force
}

# Function to update app.ts to remove property module import and route
function Update-AppFile {
    param (
        [string]$AppFilePath
    )
    
    Write-Host "Updating $AppFilePath to remove property module references"
    
    # Read the content of app.ts
    $appContent = Get-Content -Path $AppFilePath -Raw
    
    # Remove the import for the property module
    $appContent = $appContent -replace "import \{ createPropertyRoutes \} from './modules/property';\r?\n", ""
    
    # Remove the route for the property module
    $appContent = $appContent -replace "app\.use\(`\$\{API_PREFIX\}/properties`, createPropertyRoutes\(\)\);\r?\n", ""
    
    # Write the updated content back to app.ts
    Set-Content -Path $AppFilePath -Value $appContent
}

# Main script execution
Write-Host "Starting cleanup of property module..."

# Check if required directories and files exist
Test-DirectoryExists -Path $rootDir
Test-DirectoryExists -Path $srcDir
Test-DirectoryExists -Path $modulesDir
Test-DirectoryExists -Path $propertyModuleDir
Test-FileExists -Path $appFile

# Create a backup of the property module
Backup-Directory -SourceDir $propertyModuleDir -BackupDir $backupDir

# Update app.ts to remove property module references
Update-AppFile -AppFilePath $appFile

# Delete the property module directory
Write-Host "Deleting property module directory: $propertyModuleDir"
Remove-Item -Path $propertyModuleDir -Recurse -Force

Write-Host "Property module cleanup completed successfully!"
Write-Host "Backup created at: $backupDir"