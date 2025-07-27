# start-servers.ps1
<#
.SYNOPSIS
  Launch both backend and frontend dev servers in separate PowerShell windows.

.DESCRIPTION
  This script opens two new PowerShell windows:
    - One running `npm run dev` in the ./backend folder
    - One running `npm run dev` in the ./frontend folder

.NOTES
  Save this file at your repo root. Launch by right-click → “Run with PowerShell”, or:
    .\start-servers.ps1
#>

# Change to script’s directory
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Backend
Write-Host "🚀 Starting backend server..."
Start-Process powershell -ArgumentList @(
  '-NoExit'
  ,'-Command'
  ,"cd `"$PWD\backend`"; npm run dev"
)

# Frontend
Write-Host "🚀 Starting frontend server..."
Start-Process powershell -ArgumentList @(
  '-NoExit'
  ,'-Command'
  ,"cd `"$PWD\frontend`"; npm run dev"
)

Write-Host "All servers launched. Check the new windows for logs."
