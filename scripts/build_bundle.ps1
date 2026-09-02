$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$bundleRoot = Join-Path $project 'release\Sentinel-One'
$release = Join-Path $project 'release'
New-Item -ItemType Directory -Force $bundleRoot | Out-Null
$items = @('server.js','package.json','package-lock.json','README.md','.env.example','public','src','skills','启动 Sentinel One.bat','启动 Sentinel One.ps1','软件使用说明.txt')
foreach ($item in $items) {
  $src = Join-Path $project $item
  $dst = Join-Path $bundleRoot $item
  if (Test-Path $src) { Copy-Item -LiteralPath $src -Destination $dst -Recurse -Force }
}
$zip = Join-Path $release 'Sentinel-One-Windows.zip'
if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -Path (Join-Path $bundleRoot '*') -DestinationPath $zip -CompressionLevel Optimal
Write-Host "Created $zip"
