# LM Studio Portable Install

A portable LM Studio installation that keeps your persistent data (conversations,
settings, models, projects, the skills plugin) inside this folder instead of on
your system drive. It is designed to work on **any Windows machine/user** — nothing
is tied to a specific drive letter or username.

## What's here

| Item | Where | Tracked in git |
|---|---|---|
| Launcher (creates/repairs the portable junctions) | `Launch-LM-Studio.ps1` / `.bat` | yes |
| One-time setup | `Install-Portable.ps1` | yes |
| Shared helpers | `Portable.psm1` | yes |
| Bespoke skills | `.agents\skills\` | yes |
| Skills plugin | `Data\dot-lmstudio\extensions\plugins\khtsly\skills\` | yes |
| LM Studio app | `App\LM Studio\` | **no — you download it** |

## First-time setup on a new machine

1. **Clone or copy this folder** to a drive with lots of free space (it should NOT
   live under the LM Studio binaries). Example: `D:\lmstudioPortable`.

2. **Get the LM Studio app** from <https://lmstudio.ai> and put the binaries so this
   exists:
   ```
   <wherever-you-put-the-folder>\App\LM Studio\LM Studio.exe
   ```
   (Keep the `App\LM Studio` folder structure exactly as shown. The launcher looks
   for `LM Studio.exe` there.)

3. **Open PowerShell in that folder** (Shift + Right-click → "Open PowerShell window
   here"), then run:
   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Install-Portable.ps1
   ```
   This creates the profile junctions for **your** user, seeds the skills plugin
   config, and installs the plugin's npm dependencies (needs network access the
   first time).

4. **Launch** with `Launch-LM-Studio.bat` (or the `.ps1`).

5. In LM Studio's settings, set your **models folder** to a folder on this drive
   (e.g. `D:\lmstudioPortable\Models`) so large models stay off `C:`.

## How it works

- Your Windows profile points at this folder through **NTFS junctions**:
  - `%USERPROFILE%\.lmstudio` → `<this-folder>\Data\dot-lmstudio`
  - `%USERPROFILE%\.cache\lm-studio` → `<this-folder>\Data\cache-lm-studio`
  - `%APPDATA%\LM Studio` → `<this-folder>\Data\electron-profile`
- Every launch re-checks these junctions and repairs them if an LM Studio updater
  replaced one with a normal folder (the old folder is preserved, never deleted).
- Everything persistent lives in `<this-folder>\Data` and `.agents\skills`, so you
  can move the whole folder or clone it elsewhere and it just works — re-run
  `Install-Portable.ps1` after moving.

## Updating the app

Close LM Studio, re-download/install the new LM Studio build into
`App\LM Studio`, then launch via `Launch-LM-Studio.bat`. The launcher re-verifies
the junctions on startup. See `AGENTS.md` (§9) for the full safe-update procedure.

## Important

- Persistent data lives in `Data\` — **never delete `.lmstudio`** or treat any
  `cache` folder as throwaway. Everything important is preserved over cleanup.
- Large models, conversations, credentials, caches, and the app binaries are kept
  **out of git**. Only the portable config, launcher, and bespoke skills are tracked.
