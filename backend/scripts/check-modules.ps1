# Simple module check script

$projectRoot = "$PSScriptRoot\.."
$modulesPath = "$projectRoot\src\modules"

# Check if analytics module exists
Write-Host "Checking for analytics module..." -ForegroundColor Cyan
$analyticsModulePath = "$modulesPath\analytics"
if (Test-Path $analyticsModulePath) {
    Write-Host "Analytics module found at $analyticsModulePath" -ForegroundColor Green
} else {
    Write-Host "Error: Analytics module not found at $analyticsModulePath" -ForegroundColor Red
}

# Check for legacy modules
Write-Host "\nChecking for legacy modules..." -ForegroundColor Cyan
$legacyModules = @("audit", "flags", "visit")

foreach ($module in $legacyModules) {
    $modulePath = "$modulesPath\$module"
    if (Test-Path $modulePath) {
        Write-Host "Legacy module found: $module" -ForegroundColor Yellow
    } else {
        Write-Host "Legacy module not found: $module" -ForegroundColor Green
    }
}