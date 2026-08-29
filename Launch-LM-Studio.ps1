$ErrorActionPreference = "Stop"

# Portable LM Studio launcher. Works for any machine/user: the portable root is
# wherever this script lives, and profile paths come from the current user's
# environment. Self-heals junctions and seeds the skills plugin config on every
# run, then launches LM Studio.
$script:PortableRoot = [IO.Path]::GetFullPath($PSScriptRoot)

Import-Module (Join-Path $PSScriptRoot "Portable.psm1") -Force

$script:DataRoot   = Join-Path $script:PortableRoot "Data"
$script:Executable = Join-Path $script:PortableRoot "App\LM Studio\LM Studio.exe"

Ensure-AllMappings -PortableRoot $script:PortableRoot
Ensure-SkillsPluginConfig -PortableRoot $script:PortableRoot

if (-not (Test-Path -LiteralPath $script:Executable)) {
    throw "LM Studio executable was not found:`n$($script:Executable)`n`nPlace the LM Studio binaries in 'App\LM Studio' then re-run."
}

Write-Host "Launching LM Studio from: $($script:Executable)" -ForegroundColor Cyan
Start-Process -FilePath $script:Executable
