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
        [string]$Target,
        [switch]$Overwrite
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

            if ($Overwrite) {
                # A junction pointing to a different install. Repoint it. rmdir
                # on a junction removes ONLY the link (never the target data),
                # so the other install's data stays intact on disk.
                Write-Warning "  Re-pointing junction:"
                Write-Warning "    was: $actualTarget"
                Write-Warning "    now: $Target"
                cmd.exe /c "rmdir /q `"$Link`"" | Out-Null
                cmd.exe /c "mklink /J `"$Link`" `"$Target`"" | Out-Null
                if (-not (Test-IsReparsePoint $Link)) {
                    throw "Could not re-point junction: $Link"
                }
                Write-Host "  Re-pointed: $Link -> $Target" -ForegroundColor Yellow
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
    param(
        [string]$PortableRoot,
        [switch]$Overwrite
    )

    $dataRoot = Join-Path $PortableRoot "Data"
    $mappings = Get-PortableMappings -PortableRoot $PortableRoot -DataRoot $dataRoot

    Write-Host "Ensuring portable profile junctions.." -ForegroundColor Cyan
    foreach ($mapping in $mappings.GetEnumerator()) {
        Ensure-PortableMapping -Link $mapping.Key -Target $mapping.Value -Overwrite:$Overwrite
    }
}

# Returns $true when at least one existing profile junction points somewhere
# other than this portable root. Normal folders that replaced a junction are NOT
# treated as a mismatch (the preserve-and-recreate logic handles those safely).
function Test-PortableMappingMismatch {
    param([string]$PortableRoot)

    $dataRoot = Join-Path $PortableRoot "Data"
    $mappings = Get-PortableMappings -PortableRoot $PortableRoot -DataRoot $dataRoot

    foreach ($mapping in $mappings.GetEnumerator()) {
        $link = $mapping.Key
        $target = $mapping.Value

        if (Test-Path -LiteralPath $link) {
            if (Test-IsReparsePoint $link) {
                $item = Get-Item -LiteralPath $link -Force
                $actualTarget = @($item.Target)[0]
                $matches = $actualTarget -and
                    ([IO.Path]::GetFullPath($actualTarget).TrimEnd('\') -ieq
                     [IO.Path]::GetFullPath($target).TrimEnd('\'))
                if (-not $matches) {
                    return $true
                }
            }
        }
    }

    return $false
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
    param(
        [string]$PortableRoot,
        [string]$PluginName = "skills"
    )

    $pluginDir = Join-Path $PortableRoot `
        "Data\dot-lmstudio\extensions\plugins\khtsly\$PluginName"

    if (-not (Test-Path -LiteralPath $pluginDir)) {
        Write-Warning "Plugin folder not found: $pluginDir ($PluginName)"
        return $false
    }

    $nodeModules = Join-Path $pluginDir "node_modules"
    if (Test-Path -LiteralPath (Join-Path $nodeModules "@lmstudio\sdk")) {
        Write-Host "  Plugin dependencies already present ($PluginName)." -ForegroundColor Green
        return $true
    }

    Write-Host "  Installing plugin dependencies (npm install) for $PluginName.." -ForegroundColor Yellow
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

# Seed the knowledge base folder if it is missing. The KB root is the user-facing
# collection of corpora (one subfolder per corpus). Each corpus may carry a
# _corpus.md descriptor used as its description. This never deletes or overwrites
# existing reference documents.
function Ensure-KnowledgeBaseSetup {
    param([string]$PortableRoot)

    $dataRoot = Join-Path $PortableRoot "Data"
    $kbRoot = Join-Path $dataRoot "dot-lmstudio\knowledge-base"
    $kbReadme = Join-Path $kbRoot "README.md"

    Write-Host "Ensuring knowledge base configuration.." -ForegroundColor Cyan

    if (-not (Test-Path -LiteralPath $kbRoot)) {
        New-Item -ItemType Directory -Force -Path $kbRoot | Out-Null
        Write-Host "  Created knowledge base root: $kbRoot" -ForegroundColor Yellow
    }

    if (-not (Test-Path -LiteralPath $kbReadme)) {
        $readme = @"
# Knowledge Base

Place one folder per corpus inside this directory. Each subfolder is a
knowledge base *corpus* (e.g. film-noir, prompt-examples).

- Add reference documents (.md, .txt, .csv, source files, ...) inside a corpus
  folder; every supported file becomes searchable.
- Optionally add a ``_corpus.md`` file at the top of a corpus folder with a
  one-line description (the first paragraph is used).
- After adding or editing documents, run the ``reindex_kb`` tool (or let the
  plugin auto-index on first use) to refresh the vector index.
- In a chat, assign the corpora you want to use, and the plugin auto-retrieves
  relevant chunks from those corpora on every prompt.
"@
        Set-Content -LiteralPath $kbReadme -Value $readme -Encoding UTF8
        Write-Host "  Seeded knowledge base readme: $kbReadme" -ForegroundColor Yellow
    }
}

Export-ModuleMember -Function `
    Test-IsReparsePoint, `
    Get-PortableMappings, `
    Ensure-AllMappings, `
    Test-PortableMappingMismatch, `
    Ensure-SkillsPluginConfig, `
    Ensure-KnowledgeBaseSetup, `
    Install-PluginDependencies
