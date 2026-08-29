$ErrorActionPreference = "Stop"

# Update the portable LM Studio app + re-verify its junctions. Run this from
# update.bat (or directly). Follows the safety protocol in AGENTS.md: whatever
# it does, it preserves existing data and never deletes anything.
param(
    [switch]$SkipBackup,
    [switch]$NoLaunch
)

$script:PortableRoot = [IO.Path]::GetFullPath($PSScriptRoot)
Import-Module (Join-Path $PSScriptRoot "Portable.psm1") -Force

$script:DataRoot   = Join-Path $script:PortableRoot "Data"
$script:BackupRoot = Join-Path $script:PortableRoot "Backups"
$script:AppDir     = Join-Path $script:PortableRoot "App\LM Studio"
$script:Exe        = Join-Path $script:AppDir "LM Studio.exe"
$script:DownloadUrl = "https://lmstudio.ai/download"

function Write-Step($n, $msg) { Write-Host ""; Write-Host "[$n] $msg" -ForegroundColor Cyan }

# Candidate places LM Studio ends up after a normal per-user install.
function Get-AppSourceCandidates {
    param([string]$PortableRoot)
    $list = [System.Collections.Generic.List[string]]::new()
    $list.Add((Join-Path $PortableRoot "App\LM Studio"))
    $list.Add((Join-Path $env:LOCALAPPDATA "Programs\LM Studio"))
    $list.Add((Join-Path $env:LOCALAPPDATA "LM Studio"))
    return $list
}

# Return the candidate dir whose LM Studio.exe is newest, or $null if none has one.
function Get-NewestAppSource {
    $best = $null
    $bestTime = [datetime]::MinValue
    foreach ($c in (Get-AppSourceCandidates -PortableRoot $script:PortableRoot)) {
        $exe = Join-Path $c "LM Studio.exe"
        if (-not (Test-Path -LiteralPath $exe)) { continue }
        $t = (Get-Item -LiteralPath $exe).LastWriteTimeUtc
        if ($t -gt $bestTime) { $bestTime = $t; $best = $c }
    }
    return $best
}

function Get-InstallerInAppFolder {
    $installers = @(Get-ChildItem -LiteralPath (Join-Path $script:PortableRoot "App") `
        -Filter "*.exe" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match "LM-Studio-|LMStudio|lmstudio" })
    if ($installers.Count -gt 0) { return $installers[0].FullName }
    return $null
}

function Verify-Junctions {
    param([string]$PortableRoot)
    $dataRoot = Join-Path $PortableRoot "Data"
    $mappings = Get-PortableMappings -PortableRoot $PortableRoot -DataRoot $dataRoot

    $ok = $true
    foreach ($m in $mappings.GetEnumerator()) {
        $link = $m.Key; $target = $m.Value
        $item = Get-Item -LiteralPath $link -Force -ErrorAction SilentlyContinue
        if (-not $item) {
            Write-Warning "Missing: $link (expected junction to $target)"
            $ok = $false
        } elseif (-not (Test-IsReparsePoint $link)) {
            Write-Warning "NOT a junction: $link -> $($item.Target)"
            $ok = $false
        } else {
            $t = @($item.Target)[0]
            if ($t -and ([IO.Path]::GetFullPath($t).TrimEnd('\') -ieq [IO.Path]::GetFullPath($target).TrimEnd('\'))) {
                Write-Host "  OK  : $link -> $target" -ForegroundColor Green
            } else {
                Write-Warning "Wrong target: $link -> $t (expected $target)"
                $ok = $false
            }
        }
    }
    return $ok
}

function Stop-LMStudioProcesses {
    $procs = @(Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.ProcessName -match "LM Studio|lmstudio|lms" })
    if ($procs.Count -eq 0) {
        Write-Host "  No LM Studio processes running." -ForegroundColor Green
        return
    }
    Write-Host "  Stopping: $($procs.ProcessName -join ', ')"
    $procs | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

function Backup-Data {
    param([string]$PortableRoot)
    if ($SkipBackup) {
        Write-Host "  Skipping backup (-SkipBackup)." -ForegroundColor Yellow
        return
    }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $source = Join-Path $PortableRoot "Data"
    $target = Join-Path $PortableRoot "Backups\Data-$stamp"
    New-Item -ItemType Directory -Force -Path $target | Out-Null

    robocopy "$source" "$target" /MIR /COPY:DAT /DCOPY:DAT /R:2 /W:2 | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "Backup failed (robocopy exit code $LASTEXITCODE)."
    }
    Write-Host "  Backup created: $target" -ForegroundColor Green
}

function Invoke-Installer {
    param([string]$installer)
    Write-Host "  Running installer: $installer"
    Write-Host "  Complete the installer windows that appear, then this continues."
    $p = Start-Process -FilePath $installer -PassThru
    try { $p.WaitForExit(1200000) | Out-Null } catch { }
}

function Sync-AppIntoFolders {
    $newest = Get-NewestAppSource
    if (-not $newest) {
        Write-Host "  No LM Studio app found to place in App\LM Studio." -ForegroundColor Yellow
        return $false
    }
    # Copy the newest source into App\LM Studio (idempotent; only if missing or stale).
    $srcExe = Join-Path $newest "LM Studio.exe"
    $appExe = Join-Path $script:AppDir "LM Studio.exe"
    $need = (-not (Test-Path -LiteralPath $appExe)) -or
        ((Get-Item -LiteralPath $srcExe).LastWriteTimeUtc -gt (Get-Item -LiteralPath $appExe).LastWriteTimeUtc)
    if ($need) {
        Write-Host "  Updating App\LM Studio from $newest ..." -ForegroundColor Yellow
        robocopy "$newest" "$script:AppDir" /E /COPY:DAT /DCOPY:DAT /R:2 /W:2 |
            Out-Null
        if ($LASTEXITCODE -ge 8) { throw "Could not copy app (robocopy exit code $LASTEXITCODE)." }
    } else {
        Write-Host "  App\LM Studio already up to date." -ForegroundColor Green
    }
    return (Test-Path -LiteralPath $appExe)
}

Write-Host "=== LM Studio portable update ===" -ForegroundColor Cyan
Write-Host "Root: $($script:PortableRoot)"
Write-Host ""

Write-Step 1 "Closing LM Studio..."
Stop-LMStudioProcesses

Write-Step 2 "Verifying profile junctions..."
if (-not (Verify-Junctions -PortableRoot $script:PortableRoot)) {
    Write-Host "`nJunctions are not all valid. Run install.bat first, then re-run update.bat." -ForegroundColor Yellow
    exit 1
}

Write-Step 3 "Backing up portable data (preservation first)..."
Backup-Data -PortableRoot $script:PortableRoot

Write-Step 4 "Ensuring the app is on the latest build..."
$installer = Get-InstallerInAppFolder
if ($installer) {
    Invoke-Installer -installer $installer
} else {
    Write-Host "  No installer found in App\." -ForegroundColor Yellow
    Write-Host "  Download the new LM Studio installer from:" -ForegroundColor Yellow
    Write-Host "    $($script:DownloadUrl)" -ForegroundColor Yellow
    Write-Host "  Place it in: $script:PortableRoot\App\" -ForegroundColor Yellow
    Write-Host "  Then re-run update.bat." -ForegroundColor Yellow
    Start-Process $script:DownloadUrl
    exit 0
}

Write-Step 5 "Syncing the app into App\LM Studio..."
$haveApp = Sync-AppIntoFolders

if (-not $haveApp) {
    Write-Host "`nLM Studio executable not found at: $($script:Exe) in App\LM Studio." -ForegroundColor Yellow
    Write-Host "  After installing, either re-run update.bat or run install.bat to finish." -ForegroundColor Yellow
    exit 1
}

Write-Step 6 "Re-verifying junctions..."
if (-not (Verify-Junctions -PortableRoot $script:PortableRoot)) {
    Write-Warning "Some junctions are now invalid - run install.bat to repair them before using LM Studio."
} else {
    Write-Host "  All junctions valid." -ForegroundColor Green
}

Write-Host ""
Write-Host "Update complete." -ForegroundColor Green
Write-Host "  Next launch: Launch-LM-Studio.bat"

if (-not $NoLaunch) {
    $ans = Read-Host "Launch LM Studio now? [Y/N]"
    if ($ans -match "^(y|yes)$") {
        Start-Process -FilePath (Join-Path $script:PortableRoot "Launch-LM-Studio.bat")
    }
}
