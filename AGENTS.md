# AGENTS.md — LM Studio Portable Installation Management (multi-machine)

## Purpose

This file defines the operating instructions for managing a **portable** LM Studio
installation that can be **installed on any Windows machine/user** while keeping
persistent data off the system drive (`C:`) as far as practical.

The installation is shared as a repo/folder. The **portable root** is the physical
location of that folder — whatever drive and directory the current user chose.
Nothing is hardcoded to a specific drive letter or username; the launcher and
setup scripts derive every path from their own location and the current user's
environment.

A previous machine-specific version of this document (referencing a specific
`J:` drive and a specific Windows user) is preserved alongside as a historical
reference: `AGENTS.md.bak-*`.

---

# 1. Installation Layout

Portable root (referred to below as `<PortableRoot>`):

```text
<PortableRoot>\
├── App\
│   └── LM Studio\
│       └── LM Studio.exe     <- binaries the user downloads from LM Studio
├── Data\
│   ├── dot-lmstudio\
│   ├── cache-lm-studio\
│   └── electron-profile\
├── .agents\
│   └── skills\               <- bespoke skills (tracked in git)
├── Backups\
├── Launch-LM-Studio.ps1      <- daily launcher (path-agnostic)
├── Launch-LM-Studio.bat      <- wrapper
├── Install-Portable.ps1      <- one-time setup for a new machine
├── Portable.psm1             <- shared helpers
└── AGENTS.md                 <- this file
```

Main executable:

```text
<PortableRoot>\App\LM Studio\LM Studio.exe
```

Portable data root:

```text
<PortableRoot>\Data
```

`<PortableRoot>` is found at runtime as the location of `Launch-LM-Studio.ps1`
(`$PSScriptRoot`), so it works anywhere. The launcher never writes to the
profile directly; it only creates junctions that redirect the profile paths
into `<PortableRoot>\Data`.

---

# 2. Critical Junction Mappings

The following Windows-profile paths are presented to LM Studio at their normal
locations, but their actual storage lives on `<PortableRoot>\Data`.

Required mappings (all are NTFS directory junctions):

```text
%USERPROFILE%\.lmstudio
    -> <PortableRoot>\Data\dot-lmstudio

%USERPROFILE%\.cache\lm-studio
    -> <PortableRoot>\Data\cache-lm-studio

%APPDATA%\LM Studio
    -> <PortableRoot>\Data\electron-profile
```

These are created automatically by `Launch-LM-Studio.ps1` and `Install-Portable.ps1`.

Do not assume that seeing a path such as:

```text
%USERPROFILE%\.lmstudio\conversations
```

means the data is physically stored on the system drive. If `.lmstudio` is a
valid junction, Explorer and applications may keep displaying the logical
profile path while the physical files live under `<PortableRoot>\Data`.

---

# 3. Important LM Studio Data

The portable `.lmstudio` target has historically contained:

```text
.internal
bin
config-presets
conversations
credentials
extensions
hub
models
projects
scratchpads
server-logs
user-files
working-directories
plugin-data
skills
mcp.json
settings.json
```

Treat this entire directory as persistent user data. Never delete, replace, or
casually rebuild:

```text
<PortableRoot>\Data\dot-lmstudio
```

because it may hold conversation history, projects, configuration, credentials,
extensions, and other user state.

Likewise, do not assume anything named `cache` is disposable. LM Studio has
historically stored meaningful state under cache-related paths.

Only the bespoke skills plugin under
`<PortableRoot>\Data\dot-lmstudio\extensions\plugins\khtsly\skills` is tracked
in git. Everything else in `dot-lmstudio` is per-machine and should be ignored.

---

# 4. Verifying the Installation

Before any structural change, run:

```powershell
Get-Item `
    "$env:USERPROFILE\.lmstudio",
    "$env:USERPROFILE\.cache\lm-studio",
    "$env:APPDATA\LM Studio" `
    -Force |
Format-Table FullName,LinkType,Target -AutoSize
```

Expected result: all three paths report `Junction`; targets point into
`<PortableRoot>\Data`.

Also verify with:

```powershell
cmd /c dir "$env:USERPROFILE" /AL
```

For lower-level inspection:

```powershell
fsutil reparsepoint query "$env:USERPROFILE\.lmstudio"
```

Never proceed with a destructive migration or cleanup unless the junction state
has been verified.

---

# 5. Verifying Conversation Storage

Confirm that conversation history physically lands under the portable tree:

```powershell
Get-ChildItem `
    "<PortableRoot>\Data\dot-lmstudio\conversations" `
    -Recurse -File |
Sort-Object LastWriteTime -Descending |
Select-Object -First 20 FullName,Length,LastWriteTime
```

A conversation created through the logical path
`%USERPROFILE%\.lmstudio\conversations` should appear under
`<PortableRoot>\Data\dot-lmstudio\conversations`. These are two paths to the
same files when the junction works.

A quick junction test:

```powershell
"junction-test" | Set-Content "$env:USERPROFILE\.lmstudio\conversations\junction-test.txt"
Get-Content "<PortableRoot>\Data\dot-lmstudio\conversations\junction-test.txt"
Remove-Item "<PortableRoot>\Data\dot-lmstudio\conversations\junction-test.txt"
```

---

# 6. Normal Launch Procedure

Do not intentionally launch LM Studio via a newly-created installer shortcut
after an update until junctions have been checked.

Preferred launch target:

```text
<PortableRoot>\App\LM Studio\LM Studio.exe
```

Launcher scripts live at the portable root:

```text
<PortableRoot>\Launch-LM-Studio.ps1
<PortableRoot>\Launch-LM-Studio.bat
```

Manual PowerShell launch:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<PortableRoot>\Launch-LM-Studio.ps1"
```

---

# 7. Launcher Requirements

`Launch-LM-Studio.ps1` must perform this sequence on every run:

1. Derive `<PortableRoot>` from `$PSScriptRoot` (never a hardcoded drive/user).
2. Verify each target data directory exists (create if missing).
3. Check each expected profile path.
4. Confirm each existing profile path is a reparse point / junction.
5. Confirm each junction points to the correct `<PortableRoot>\Data` target.
6. If an updater replaced a junction with a normal directory:
   - DO NOT delete it;
   - rename it to a timestamped recovery directory;
   - recreate the required junction.
7. Seed the skills plugin config so `<PortableRoot>\.agents\skills` stays correct.
8. Verify the LM Studio executable exists before launching.

The launcher must favor preservation over cleanup. If state is ambiguous, stop
with an explicit error rather than deleting or overwriting data.

---

# 8. One-Time Setup (new machine)

Run `Install-Portable.ps1` once after placing the LM Studio binaries. It:

1. Verifies the portable tree + executable.
2. Creates the profile junctions for the current user.
3. Seeds the skills plugin config.
4. Installs the skills plugin npm dependencies (`@lmstudio/sdk`, `zod`).
5. Prints a status report with next steps.

It is idempotent and safe to re-run. It never deletes existing data.

---

# 9. Update Procedure

LM Studio updates are the highest-risk operation because LM Studio does not
officially guarantee this portable-junction configuration. Prefer the automated
path: place the new installer in `App\` and run `update.bat` (which drives the
full sequence below). The manual procedure is retained as the reference for what
it does and for troubleshooting.

## Step 1 — Close LM Studio

Stop LM Studio and relevant background processes:

```powershell
Get-Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessName -match "LM Studio|lmstudio|lms" } |
    Stop-Process -Force
```

Be careful not to terminate unrelated processes with an overly broad match.

## Step 2 — Verify Junctions

Run the verification in section 4. Do not update until the state is understood.

## Step 3 — Back Up Portable Data

Create a timestamped backup:

```powershell
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$source = "<PortableRoot>\Data"
$target = "<PortableRoot>\Backups\Data-$stamp"

robocopy "$source" "$target" /MIR /COPY:DAT /DCOPY:DAT /R:2 /W:2

if ($LASTEXITCODE -ge 8) { throw "Backup failed with robocopy exit code $LASTEXITCODE" }

Write-Host "Backup completed: $target"
```

Important: the destination must be a NEW timestamped backup directory; do not
casually use `/MIR` against a shared or existing backup tree. `robocopy` exit
codes below 8 are not necessarily failures.

## Step 4 — Perform Update

The application installation remains under `<PortableRoot>\App\LM Studio`.
Do not manually delete the portable data directories. If the updater offers to
immediately launch LM Studio, preferably disable that.

## Step 5 — Verify Junctions BEFORE First Post-Update Launch

Repeat the section 4 verification. If the updater created an ordinary folder
where a junction previously existed: stop, preserve the new folder with a
timestamped name, inspect it for new data, recreate the correct junction, and do
not delete either copy until differences are understood.

## Step 6 — Launch Through the Portable Launcher

Launch only after verification.

## Step 7 — Post-Update Test

Create a disposable conversation with a distinctive name, close LM Studio, then
inspect `<PortableRoot>\Data\dot-lmstudio\conversations` for new activity.

---

# 10. Junction Recreation Procedure

If an expected junction is absent and the corresponding profile path does NOT
contain unique data, recreate it:

```powershell
cmd.exe /c "mklink /J `"%USERPROFILE%\.lmstudio`" `"<PortableRoot>\Data\dot-lmstudio`""
cmd.exe /c "mklink /J `"%USERPROFILE%\.cache\lm-studio`" `"<PortableRoot>\Data\cache-lm-studio`""
cmd.exe /c "mklink /J `"%APPDATA%\LM Studio`" `"<PortableRoot>\Data\electron-profile`""
```

However: never run `mklink` over an existing normal directory. First inspect
and preserve it under a timestamped name:

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Move-Item "%USERPROFILE%\.lmstudio" "%USERPROFILE%\.lmstudio.recreated-$timestamp"
```

Then create the junction.

---

# 11. Data Recovery Rules

If LM Studio appears to lose conversations, settings, models, or projects:

DO NOT:
- reinstall immediately;
- delete `.lmstudio`;
- overwrite the portable data tree;
- delete timestamped backup/recovery directories;
- assume the newest directory is authoritative.

Instead:
1. stop LM Studio;
2. inspect junction state;
3. inspect `<PortableRoot>\Data\dot-lmstudio`;
4. inspect any `*.recreated-*` / `*.pre-portable-*` trees;
5. compare timestamps and file counts;
6. identify which tree holds the newest conversation/settings data;
7. back up before merging anything.

Preservation comes before repair.

---

# 12. Model Storage

`<PortableRoot>\Data\dot-lmstudio\models` is already physically portable.
LM Studio may also be configured for a separate model location such as
`<PortableRoot>\Models`. Before changing model paths, inspect the currently
configured path and existing files. Do not create duplicate model trees unless
there is a specific migration requirement. Large GGUF/model files should not be
copied between locations without a specific need.

---

# 13. System Drive Policy

Persistent LM Studio user content should not physically reside on the system
drive where practical. Acceptable residual items: tiny pointer files, Windows
registry entries, installer/update metadata, shortcuts, temporary OS files.

Redirect to the portable tree: conversations, projects, user files, persistent
state, settings/configuration, model metadata where feasible, models, and
persistent cache/runtime data.

A logical path beginning with `%USERPROFILE%\...` is acceptable when it is a
verified NTFS junction whose physical target is under `<PortableRoot>\Data`.

---

# 14. Never Do These Things

An agent managing this installation must NEVER:

1. Delete `.lmstudio` merely because it appears under the user profile.
2. Assume a shortcut icon means a Windows `.lnk` file.
3. Treat a junction as duplicated storage.
4. Delete `*.pre-portable-*` without confirming recovery is unnecessary.
5. Use `/MIR` against an existing valuable directory without confirming
   source/destination semantics.
6. Reinstall LM Studio as the first troubleshooting step.
7. Allow an updater-created empty profile directory to silently become the live
   profile.
8. Replace data on the portable tree with an empty or newly generated profile.
9. Delete `.lmstudio-home-pointer` without determining its role.
10. Assume LM Studio's folder layout is stable across releases.
11. Assume cache directories contain only disposable files.
12. Modify junctions while LM Studio is running.
13. Perform destructive operations without a current backup.

---

# 15. Diagnostic Commands

## Show junction state

```powershell
Get-Item `
    "$env:USERPROFILE\.lmstudio",
    "$env:USERPROFILE\.cache\lm-studio",
    "$env:APPDATA\LM Studio" `
    -Force |
Format-List FullName,Attributes,LinkType,Target
```

## List reparse points in user profile

```powershell
cmd /c dir "$env:USERPROFILE" /AL
```

## Inspect data root

```powershell
Get-ChildItem "<PortableRoot>\Data\dot-lmstudio" -Force
```

## Find newest conversation files

```powershell
Get-ChildItem `
    "<PortableRoot>\Data\dot-lmstudio\conversations" `
    -Recurse -File |
Sort-Object LastWriteTime -Descending |
Select-Object -First 20 FullName,Length,LastWriteTime
```

## Calculate data size

```powershell
$size = (
    Get-ChildItem "<PortableRoot>\Data" -Recurse -Force -File -ErrorAction SilentlyContinue |
    Measure-Object Length -Sum
).Sum
"{0:N2} GB" -f ($size / 1GB)
```

## Check executable

```powershell
Test-Path "<PortableRoot>\App\LM Studio\LM Studio.exe"
```

---

# 16. Skills Plugin Maintenance

The installed LM Studio instance carries a Claude-style **skills plugin**
(`khtsly/skills`). It discovers skill directories, injects an
`<available_skills>` block into prompts, provides skill/file tools, and supports
explicit `/skill-name` activation.

## Plugin installation

```text
<PortableRoot>\Data\dot-lmstudio\extensions\plugins\khtsly\skills
```

- `manifest.json`: owner `khtsly`, name `skills`.
- Runtime dependency: `@lmstudio/sdk@^1.5.0` resolved from the plugin's own
  `node_modules` (installed by `Install-Portable.ps1`).
- Source repositories:
  - fork (source of truth): `https://github.com/OrphBean/LMS_skills`
  - upstream: `https://github.com/imezx/skills`

Treat the plugin folder as persistent state (it lives under `.lmstudio` and is
physically in the portable tree). Never delete it; do not prune its
`node_modules`.

## Skills directory

The configured skills root is:

```text
<PortableRoot>\.agents\skills
```

This is user data in the portable tree, not inside the plugin folder. The
configured path is stored in plugin settings, seeded automatically to find
`<PortableRoot>\.agents\skills`:

```text
<PortableRoot>\Data\dot-lmstudio\plugin-data\lms-skills\settings.json
```

## Explicit-activation regex

Explicit activation uses a slash-token regex that must not treat closing
XML/HTML-like tag boundaries (e.g. `</d>`, `</skill>`) as skill references:

```ts
// NOTE: the '<' in the negative lookbehind is intentional - it prevents
// '</...>' closing tags from being misread as skill directives.
export const EXPLICIT_SKILL_REGEX = /(?<![a-zA-Z0-9:/<])\/([a-z][a-z0-9._-]*)/g;
```

If you change the source, rebuild the bundle (`production.js`) or the installed
plugin keeps running old code. See the rebuild notes below.

## Editing the plugin

The plugin executes the bundled artifact:

```text
<PortableRoot>\Data\dot-lmstudio\extensions\plugins\khtsly\skills\.lmstudio\production.js
```

Source lives in `src/` in the same folder. After editing `src/`, rebuild:

```powershell
$esbuild = "<PortableRoot>\App\LM Studio\resources\app\.webpack\bin\esbuild.exe"
# if not present, use any local esbuild (e.g. 'npx esbuild' or a global binary)
& $esbuild ".lmstudio\entry.ts" --bundle --format=cjs --platform=node `
    --target=es2022 --outfile=".lmstudio\production.js" `
    --external:@lmstudio/sdk --external:zod
```

Run from the plugin directory. Back up `production.js` (timestamped) before
rebuilding. Restart LM Studio after rebuilding so the plugin process reloads.

## Debugging

- `LMS_SKILLS_DEBUG=1` in the plugin process environment yields concise `[skills]`
  log lines. Logs never include full prompts or skill bodies.
- Plugin stdout appears in the server log under
  `<PortableRoot>\Data\dot-lmstudio\server-logs\YYYY-MM\YYYY-MM-DD.1.log`
  as `[Plugin(khtsly/skills)] stdout: ...`.
- End-to-end verification: after a chat, search the newest file under
  `<PortableRoot>\Data\dot-lmstudio\conversations\` for `<available_skills>` or
  `<skill_context>`.

---

# 17. Handoff Objective

An agent receiving this file should be able to:

- diagnose the portable setup;
- launch it safely;
- verify conversations are physically stored in the portable tree;
- update LM Studio without losing the portable mappings;
- repair junctions if an updater replaces them;
- preserve and reconcile recovery directories;
- keep persistent LM Studio data off the system drive as far as practical;
- maintain the skills plugin (rebuild bundle after source edits, verify
  preprocessor injection, keep the skills directory in the portable tree).

Do not redesign this installation unless there is a specific technical reason to
do so. If a future LM Studio release introduces an officially supported
portable home/data-root mechanism, evaluate it against this junction setup.
Prefer an official supported mechanism if it preserves all current data and
keeps persistent user data in the portable tree.
