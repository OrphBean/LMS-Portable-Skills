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
junction used to be. **Use the bat-driven update — it follows the safe protocol.**

1. Download the new LM Studio installer from **<https://lmstudio.ai/download>** and
   place it in the `App\` folder (e.g. `App\LM-Studio-x.y.z-x64.exe`).
2. Double-click **`update.bat`**. It will:
   - close LM Studio (and any `LM Studio` / `lms` background processes);
   - verify the profile junctions (and stop if they are not all valid — run
     `install.bat` first);
   - **back up** your portable data to `Backups\Data-<timestamp>` (press `Y`; or
     skip with `-SkipBackup`);
   - run the installer you placed in `App\` (complete the installer windows that
     open);
   - copy the freshly installed app into `App\LM Studio`, then re-verify the
     junctions.
3. If no installer is present, `update.bat` opens the download page and tells you
   to place the installer in `App\` then re-run.

Rarely, an LM Studio updater can still replace a junction with a normal folder
while updating itself. If `Launch-LM-Studio.bat` ever reports that, stop and
consult `AGENTS.md` (§9 full procedure, §11 data recovery) — preservation always
comes before repair.

> Advanced: run `Update-LM-Studio.ps1` directly if you prefer prompts/options
> (`-SkipBackup` to skip the backup, `-NoLaunch` to not auto-launch).

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
