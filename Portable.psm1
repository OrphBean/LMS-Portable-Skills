$ErrorActionPreference = "Stop"

# Shared helpers for the portable LM Studio management scripts. The portable
# root is always the physical location of the repo/installation, so every
# helper takes it explicitly rather than assuming a hardcoded drive or user.

function Test-IsReparsePoint {
    param([System.IO.DirectoryInfo]$Path)

    if (-not (Test-Path -LiteralPath $Path.FullName)) {
        return $false
    }

    $item = Get-Item -LiteralPath $Path.FullName -Force
    return [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
}

function Get-PortableMappings {
    param([string]$PortableRoot, [string]$DataRoot)

    return [ordered]@{
        "$env:USERPROFILE\.lmstudio" =
            (Join-Path $DataRoot "dot-lmstudio")

        "$env:USERPROFILE\.cache\lm-studio" =
            (Join-Path $DataRoot "cache-lm-studio")

        "$env:APPDATA\LM Studio" =
            (Join-Path $DataRoot "electron-profile")
    }
}

function Ensure-PortableMapping {
    param(
        [string]$Link,
        [string]$Target
    )

    New-Item -ItemType Directory -Force -Path $Target | Out-Null
    New-Item -ItemType Directory -Force -Path (Split-Path $Link -Parent) | Out-Null

    if (Test-Path -LiteralPath $Link) {
        if (Test-IsReparsePoint $Link) {
            $item = Get-Item -LiteralPath $Link -Force
            $actualTarget = @($item.Target)[0]

            if ($actualTarget -and
                ([IO.Path]::GetFullPath($actualTarget).TrimEnd('\') -ieq
                 [IO.Path]::GetFullPath($Target).TrimEnd('\'))) {
                Write-Host "  Valid: $Link -> $Target" -ForegroundColor Green
                return
            }

            throw "The link exists but points to the wrong target: $Link"
        }

        # An updater recreated a normal directory. Preserve it, never delete.
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $recovery = "$Link.recreated-$timestamp"

        Write-Warning "A normal folder has replaced the junction:"
        Write-Warning "  $Link"
        Write-Warning "Preserving it as: $recovery"

        Move-Item -LiteralPath $Link -Destination $recovery
    }

    cmd.exe /c "mklink /J `"$Link`" `"$Target`"" | Out-Null

    if (-not (Test-IsReparsePoint $Link)) {
        throw "Could not create junction: $Link"
    }

    Write-Host "  Restored: $Link -> $Target" -ForegroundColor Yellow
}

function Ensure-AllMappings {
    param([string]$PortableRoot)

    $dataRoot = Join-Path $PortableRoot "Data"
    $mappings = Get-PortableMappings -PortableRoot $PortableRoot -DataRoot $dataRoot

    Write-Host "Ensuring portable profile junctions.." -ForegroundColor Cyan
    foreach ($mapping in $mappings.GetEnumerator()) {
        Ensure-PortableMapping -Link $mapping.Key -Target $mapping.Value
    }
}

# The skills root lives in the portable tree. Keep the plugin's saved path
# pointing at the physical location even if the tree is moved or cloned to a
# different drive. Only touch the file when the value is missing or stale.
function Ensure-SkillsPluginConfig {
    param([string]$PortableRoot)

    $dataRoot = Join-Path $PortableRoot "Data"
    $settingsDir = Join-Path $dataRoot "dot-lmstudio\plugin-data\lms-skills"
    $settingsFile = Join-Path $settingsDir "settings.json"
    $skillsRoot = Join-Path $PortableRoot ".agents\skills"

    Write-Host "Ensuring skills plugin config.." -ForegroundColor Cyan

    if (-not (Test-Path -LiteralPath $settingsFile)) {
        New-Item -ItemType Directory -Force -Path $settingsDir | Out-Null
        $settings = [ordered]@{
            skillsPaths = @($skillsRoot)
            autoInject  = $true
            maxSkillsInContext = 15
            shellPath   = ""
            windowsShell = "cmd"
        }
        $settings | ConvertTo-Json -Depth 5 |
            Set-Content -LiteralPath $settingsFile -Encoding UTF8
        Write-Host "  Seeded skills plugin config: $settingsFile" -ForegroundColor Yellow
        return
    }

    $parsed = Get-Content -LiteralPath $settingsFile -Raw | ConvertFrom-Json
    $current = @($parsed.skillsPaths) | Where-Object { $_ }
    $matches = $current.TrimEnd('\') -ieq $skillsRoot.TrimEnd('\')

    if (-not $matches) {
        $parsed.skillsPaths = @($skillsRoot)
        $parsed | ConvertTo-Json -Depth 5 |
            Set-Content -LiteralPath $settingsFile -Encoding UTF8
        Write-Host "  Re-pointed skills path to: $skillsRoot" -ForegroundColor Yellow
    }
}

function Install-PluginDependencies {
    param([string]$PortableRoot)

    $pluginDir = Join-Path $PortableRoot `
        "Data\dot-lmstudio\extensions\plugins\khtsly\skills"

    if (-not (Test-Path -LiteralPath $pluginDir)) {
        Write-Warning "Skills plugin folder not found: $pluginDir"
        return $false
    }

    $nodeModules = Join-Path $pluginDir "node_modules"
    if (Test-Path -LiteralPath (Join-Path $nodeModules "@lmstudio\sdk")) {
        Write-Host "  Plugin dependencies already present." -ForegroundColor Green
        return $true
    }

    Write-Host "  Installing plugin dependencies (npm install).." -ForegroundColor Yellow
    Write-Host "    cwd: $pluginDir"
    Write-Host "    This may take a moment and needs network access."
    Write-Host "    Run manually if skipped:  (from '$pluginDir')  npm install"

    try {
        Push-Location -LiteralPath $pluginDir
        npm install @lmstudio/sdk zod --no-audit --no-fund
        $exit = $LASTEXITCODE
        if ($exit -ne 0) {
            Write-Warning "npm install exited with code $exit - run it manually in '$pluginDir'."
            return $false
        }
        return $true
    } catch {
        Write-Warning "Could not run npm install: $($_.Exception.Message)"
        return $false
    } finally {
        Pop-Location
    }
}

Export-ModuleMember -Function `
    Test-IsReparsePoint, `
    Get-PortableMappings, `
    Ensure-AllMappings, `
    Ensure-SkillsPluginConfig, `
    Install-PluginDependencies
