# Cleanup Investments Module Script
# This script removes the legacy investments module after its functionality has been migrated to the investment and investor modules

# Set strict mode to catch errors
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Define paths
$rootDir = "$PSScriptRoot/.."
$srcDir = "$rootDir/src"
$modulesDir = "$srcDir/modules"
$investmentsModuleDir = "$modulesDir/investments"
$appFile = "$srcDir/app.ts"
$backupDir = "$rootDir/backups/investments-module-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

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

# Main script execution
Write-Host "Starting cleanup of investments module..."

# Check if required directories and files exist
Test-DirectoryExists -Path $rootDir
Test-DirectoryExists -Path $srcDir
Test-DirectoryExists -Path $modulesDir
Test-DirectoryExists -Path $investmentsModuleDir
Test-FileExists -Path $appFile

# Verify that the individual investment and investor modules exist
$investmentModuleDir = "$modulesDir/investment"
$investorModuleDir = "$modulesDir/investor"

if (-not (Test-Path -Path $investmentModuleDir -PathType Container)) {
    Write-Error "Investment module not found at $investmentModuleDir. Cannot proceed with cleanup."
    exit 1
}

if (-not (Test-Path -Path $investorModuleDir -PathType Container)) {
    Write-Error "Investor module not found at $investorModuleDir. Cannot proceed with cleanup."
    exit 1
}

Write-Host "Verified that both investment and investor modules exist."

# Create a backup of the investments module
Backup-Directory -SourceDir $investmentsModuleDir -BackupDir $backupDir

# Delete the investments module directory
Write-Host "Deleting investments module directory: $investmentsModuleDir"
Remove-Item -Path $investmentsModuleDir -Recurse -Force

Write-Host "Investments module cleanup completed successfully!"
Write-Host "Backup created at: $backupDir"
Write-Host "The investments module has been removed, and its functionality is now provided by the separate investment and investor modules."
