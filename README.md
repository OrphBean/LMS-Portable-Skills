# LMS-Portable-Skills

A **portable LM Studio** installation that keeps all persistent data
(conversations, projects, settings, models, the bespoke skills plugin) inside
this folder instead of on your system drive. It is designed to run on **any
Windows machine/user** — nothing is hardcoded to a drive letter or a username.
You bring your own LM Studio binaries; this bundle provides the portable launch
plumbing and the custom skills.

> The folder you clone/copy **is** the portable root. Wherever you put it, the
> launcher and setup scripts derive everything from their own location.

---

## What's in this repo

| Item | Location | Tracked |
|---|---|---|
| **You** download & install LM Studio | `App\LM Studio\` | no |
| Launcher (creates/repairs portable junctions, seeds config) | `Launch-LM-Studio.bat` / `.ps1` | yes |
| One-time per-machine setup | `Install-Portable.ps1` | yes |
| Shared helpers | `Portable.psm1` | yes |
| Bespoke skills | `.agents\skills\` | yes |
| Skills plugin (Claude-style `/skill-name` activation) | `Data\dot-lmstudio\...\khtsly\skills\` | yes |

---

## First-time install (new machine)

### 1. Get this folder
Clone the repo (or copy the folder) to a drive with plenty of free space and a
stable path, e.g.:

```
D:\lmstudioPortable
```

Do **not** put this inside `C:\Users\...` if you want to keep persistent data off
`C:`.

### 2. Install the LM Studio app
- Download the Windows installer from **<https://lmstudio.ai/download>**.
- Run the installer, and either:
  - **(recommended)** choose the install location
    `<your folder>\App\LM Studio`, **or**
  - install LM Studio normally (wherever it defaults) — the setup step will copy
    it into `App\LM Studio` for you.

Either way, the goal is that this file ends up existing:

```
<your folder>\App\LM Studio\LM Studio.exe
```

### 3. Run the setup
Just double-click **`install.bat`**. It is idempotent and safe to re-run. It will:
- create the folder structure (`App\LM Studio`, `Data\...`, `.agents\skills`, `Backups`, `Models`);
- find the LM Studio app (in `App\LM Studio`, or copy it from your install location);
- create the profile **junctions** for **your** user (see *How it works*);
- seed the skills plugin config to point at `.agents\skills`;
- install the skills plugin's npm dependencies (`@lmstudio/sdk`, `zod`) — first run needs network access.

### 4. Launch
Double-click **`Launch-LM-Studio.bat`**. The launcher re-checks and self-heals the
junctions on every start.

### 5. Move models off C:
In LM Studio **Settings → My Models**, set the download folder to a directory on
this drive, e.g. `D:\lmstudioPortable\Models`, so large models don't fill `C:`.

---

## How it works

Your Windows profile is redirected into this folder through **NTFS junctions**
(created automatically):

```
%USERPROFILE%\.lmstudio        ->  <folder>\Data\dot-lmstudio
%USERPROFILE%\.cache\lm-studio ->  <folder>\Data\cache-lm-studio
%APPDATA%\LM Studio            ->  <folder>\Data\electron-profile
```

Every launch verifies these junctions. If an LM Studio updater replaced one with
a normal folder, the launcher **preserves** that folder under a timestamped name
(`*.recreated-*`) and recreates the junction — it never deletes data.

Everything persistent lives in `<folder>\Data` and `.agents\skills`, so you can
move the whole folder or clone it somewhere else and it just works (re-run
`Install-Portable.ps1` after moving).

---

## Updating LM Studio

Updates are the highest-risk step because LM Studio does not officially support
this junction setup, and an updater can silently recreate a normal folder where a
junction used to be. **Always update through the portable launcher, never a
freshly-created shortcut.**

1. **Close LM Studio** (and any `LM Studio` / `lms` background processes).
2. **Verify the junctions** first (optional but recommended):
   ```powershell
   Get-Item "$env:USERPROFILE\.lmstudio","$env:USERPROFILE\.cache\lm-studio","$env:APPDATA\LM Studio" -Force |
     Format-Table FullName,LinkType,Target -AutoSize
   ```
   All three should report `Junction` pointing into `<folder>\Data`.
3. **Back up your data** (recommended before any update):
   ```powershell
   $stamp = Get-Date -Format "yyyyMMdd-HHmmss"; $src = "<folder>\Data"; $dst = "<folder>\Backups\Data-$stamp"
   robocopy $src $dst /MIR /COPY:DAT /DCOPY:DAT /R:2 /W:2
   ```
4. **Install the new LM Studio build** into `App\LM Studio` (download the new
   version from <https://lmstudio.ai/download> and replace `LM Studio.exe` + resources,
   or run its installer). Do not delete `Data`.
5. **Refuse** any "launch LM Studio now" prompt the updater offers.
6. **Launch via `Launch-LM-Studio.bat`** — the launcher re-verifies the junctions
   on startup. If it reports a normal folder replaced a junction, stop; the old
   folder is preserved for inspection; verify it holds nothing new before removing.
7. **Confirm it works** — run a quick request and check that new activity appears
   under `<folder>\Data\dot-lmstudio\conversations`.

If anything looks off at any step, stop and consult `AGENTS.md` (§9 full update
procedure, §11 data recovery) — preservation always comes before repair.

---

## Updating the skills / plugin (this repo)

After pulling updates to this repo, you usually just need to make sure the plugin
dependencies are present (re-run `Install-Portable.ps1`, or `npm install` inside
`Data\dot-lmstudio\extensions\plugins\khtsly\skills`, then restart LM Studio).

If you change the plugin source in `src\`, rebuild the bundle the plugin actually
runs (`.lmstudio\production.js`) before restarting LM Studio. See `AGENTS.md` §16.

---

## Important

- Persistent data lives in `Data\` — **never delete `.lmstudio`**, and do not treat
  any `cache` folder as throwaway. Preservation beats cleanup.
- Large models, conversations, credentials, caches, vendor plugins, and the app
  binaries are **kept out of git**. Only the portable config, launcher, and the
  bespoke skills/plugin are tracked.
- If you move the whole folder, re-run `Install-Portable.ps1` so the junction
  targets and the skills configuration follow the new path.
