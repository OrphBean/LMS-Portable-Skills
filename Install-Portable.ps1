$ErrorActionPreference = "Stop"

# One-time setup for a NEW machine. Run this after cloning the repo (or copying
# the folder) to a location of your choice, and after placing the LM Studio
# binaries in 'App\LM Studio'. It:
#   1. verifies the portable tree + LM Studio executable;
#   2. creates the profile junctions for your own user;
#   3. seeds the skills plugin config pointing into this tree;
#   4. installs the skills plugin's npm dependencies;
#   5. prints a status report.
#
# Re-run safely any time: it is idempotent and preserves existing data.
$script:PortableRoot = [IO.Path]::GetFullPath($PSScriptRoot)

Import-Module (Join-Path $PSScriptRoot "Portable.psm1") -Force

$script:DataRoot   = Join-Path $script:PortableRoot "Data"
$script:Executable = Join-Path $script:PortableRoot "App\LM Studio\LM Studio.exe"

Write-Host "=== LM Studio portable setup ===" -ForegroundColor Cyan
Write-Host "Portable root: $($script:PortableRoot)"
Write-Host "User profile : $env:USERPROFILE"
Write-Host ""

# 1. Executable / app binaries
if (-not (Test-Path -LiteralPath $script:Executable)) {
    Write-Warning "LM Studio executable missing:"
    Write-Warning "  $($script:Executable)"
    Write-Warning ""
    Write-Warning "This is expected - grab the LM Studio binaries from lmstudio.com and place"
    Write-Warning "them under 'App\LM Studio' (keep the folder name 'LM Studio.exe')."
    Write-Warning "Re-run this script after doing so."
    Write-Host ""
} else {
    Write-Host "  [OK] LM Studio executable present." -ForegroundColor Green
}

# 2. Profile junctions for THIS user
Ensure-AllMappings -PortableRoot $script:PortableRoot
Write-Host ""

# 3. Skills plugin config
Ensure-SkillsPluginConfig -PortableRoot $script:PortableRoot
Write-Host ""

# 4. Skills plugin npm dependencies
$depsOk = Install-PluginDependencies -PortableRoot $script:PortableRoot
Write-Host ""

# 5. Report
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Portable root : $($script:PortableRoot)"
Write-Host "  LM Studio exe : $(Test-Path -LiteralPath $script:Executable)"
Write-Host "  Plugin deps   : $($depsOk -or (Test-Path -LiteralPath (Join-Path $script:DataRoot 'dot-lmstudio\extensions\plugins\khtsly\skills\node_modules\@lmstudio\sdk')))"
Write-Host ""
Write-Host "Next steps:"
if (-not (Test-Path -LiteralPath $script:Executable)) {
    Write-Host "  1. Place the LM Studio binaries in 'App\LM Studio', then re-run this script."
}
Write-Host "  1. Launch with: Launch-LM-Studio.bat (or the .ps1)."
Write-Host "  2. In LM Studio, set Models/download folder to:"
Write-Host "       $(Join-Path $script:PortableRoot 'Models')  (or any folder on this drive)"
Write-Host "     so large models stay off C:."
Write-Host ""
