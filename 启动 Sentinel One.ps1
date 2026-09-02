$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Start-Process 'https://nodejs.org/'; throw '未检测到 Node.js 20+，已打开下载页面。' }
if (-not (Test-Path node_modules)) { npm install --omit=dev }
$env:AGENT_OS_ONLY='true'
Start-Process node -ArgumentList 'server.js' -WindowStyle Minimized
Start-Sleep -Seconds 2
Start-Process 'http://localhost:3000'
Write-Host 'Sentinel One 已启动。'
