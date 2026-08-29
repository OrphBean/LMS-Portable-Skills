# story-distiller

Distills long stories (often beyond the context window) into **scene-for-scene cinematic
material** for RAG injection into prompt dev for MiniMax / image-gen. The raw prose is too
wandering to be a useful retrieval corpus; the *distillation* is what gets indexed.

Output is written into the portable knowledge-base corpus tree:

```text
<PortableRoot>\Data\dot-lmstudio\knowledge-base\<corpus>\
  _corpus.md       <- description (KB uses the first paragraph)
  story.md         <- act-by-act logline
  characters.md    <- distilled character sheet (arc across scenes)
  language.md      <- gathered visual/movie language bank
  scene-0000.md …  <- one RAG unit per scene (the retrieval target)
  act-01.md …      <- optional act summaries (--acts)
  _distill.json    <- raw pass data (derived, regenerable; never hand-edit)
```

Set the chat's `assignedCorpora` to the corpus name with `Auto-Retrieve` on, and the KB plugin
embeds/injects the scene cards. No recompilation of the plugins is needed.

## How it stays within the context window

The story is segmented into contiguous **slices** (paragraph-aware, with overlap). For each
slice, one LM Studio call is made with:

```text
[carried state (slate)] + [story slice]  ->  { scene card, updated slate }
```

The **slate** carries forward characters/state/goal, timeline position, planted items and open
threads, and is compressed when it passes `--slate-chars`. This rolling state is what keeps
continuity across the window edge. (See RAPTOR + Anthropic's Contextual Retrieval: the summary at
the top should be *specific*, chunk-situating context, not a generic "this chunk is a story".)

## Automation (batch)

Process a folder or many files with one command; one corpus per story:

```powershell
node dist/main.js --input stories/ --model <my-llm> --acts
node dist/main.js --input a.txt,b.pdf --model <my-llm>
```

Supported sources: `.txt`, `.md`, `.markdown`, `.docx` (Word), `.pdf`, plus `.rst/.text/.log`.
A bad story never aborts the rest; it is marked failed and the batch continues.

## Narrow-band focus config

The base scene schema is stable. A **focus config** layers optional, named per-scene fields (mise
en scène, costumes, behaviour, …) and a free-form instruction, so you steer what the distiller digs
out without redesigning the pipeline. See `focus.example.json`.

```powershell
node dist/main.js story.md --model <my-llm> --config focus.json
```

```json
{
  "instructions": "Treat this as cinema: foreground mood and atmosphere, locate every scene in a specific place and time of day.",
  "aspects": [
    { "key": "miseEnScene", "label": "Mise en scène", "prompt": "Staging, blocking, composition; depth and foreground/background relations." },
    { "key": "costumes",     "label": "Costume design", "prompt": "Garments, fabrics, textures, colours; how dress signals status or mood." },
    { "key": "behaviour",    "label": "Character behaviour", "prompt": "Recurring gestures, micro-behaviours, tics, body language." }
  ]
}
```

`instructions` is optional; each aspect has a `key` (identifier), `label` (display) and `prompt`
(guidance). The aspect fields are added to every scene card, both in the `.md` and `_distill.json`.

## HTML UI (launch from the .bat)

Start the local UI and browser:

```powershell
story-distiller\distill-ui.bat
```

This builds once, serves a local page at `http://127.0.0.1:4180`, and opens your browser. In the
UI you can:

- set model id, base URL, slice/slate/max-token/temperature, and act-summary toggle;
- write a focus instruction and add/remove **focus aspects**;
- drag and drop `.txt`, Word (`.docx`) and `.pdf` stories;
- press **Distill** and watch progress stream per story; per-story corpora are written, and a
  summary is shown with each corpus name.

The UI posts to a local Node HTTP server (`dist\main.js --serve`), which runs the batch against
LM Studio. You can also run it directly: `node dist/main.js --serve --port 4180`. With the
**Auto-assign corpora** toggle on (default), each written corpus is added to the KB plugin's
durable `defaultCorpora` (in `plugin-data\lms-knowledge-base\settings.json`) and the derived
`index.json` is invalidated so the plugin re-indexes and auto-retrieves from them. The KB plugin
bundle was extended + rebuilt for this fallback, so **restart LM Studio** once for it to load.

### Long runs and connection assurance

`distill-ui.bat` starts the server in the **background** so **closing the launcher window does
not stop a long distillation**. It writes the server PID to `distiller.<port>.pid`; stop the
server with `stop-distiller.bat` (same folder). If a server is already running, the launcher just
re-opens the browser and tells you — it never crashes.

The UI shows a live **connection status** (idle / connecting / working / done, with elapsed time
and last-update), streams **per-slice progress** for long stories, and a **health watchdog** polls
the server every 5s — if the server stops, you get an explicit `CONNECTION LOST` warning instead
of an apparent hang.

## Setup

```powershell
cd story-distiller
npm install        # once
npm run build      # compiles src/ -> dist/
```

## Requirements

- LM Studio running with a **chat model loaded** (connect on `ws://127.0.0.1:1234` by default;
  the real port is in `Data\dot-lmstudio\.internal\http-server.json`).
- **The model's "thinking" must be OFF**, otherwise its reasoning block consumes the whole output
  budget and no answer is returned. Toggle it off for the loaded model in LM Studio.
- The model should produce JSON reliably. Pass an explicit `--model` only if the loaded default
  is not what you want; an undeclared instance can behave differently.

## Key flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `--input path[,path]` | — | story file(s) or folder(s) to process (batch) |
| `--config <json>` | — | focus config: instructions + aspects |
| `--serve [--port n]` | off | start the local HTML UI (default port 4180) |
| `--model` | loaded model | LM Studio model identifier |
| `--base-url` | `ws://127.0.0.1:1234` | LM Studio server |
| `--corpus` | from title | KB corpus folder name (single story) |
| `--slice-chars` | 16000 | source characters per slice |
| `--overlap-chars` | 1200 | overlap carried between slices |
| `--slate-chars` | 8000 | max carried slate characters (auto-compact above) |
| `--temperature` | 0.3 | sampling temperature |
| `--max-tokens` | 8000 | max output tokens per call |
| `--max-calls` | 200 | safety cap on model calls per story |
| `--acts` | off | build act/sequence summaries |
| `--assign` / `--no-assign` | on | auto-add written corpora to the KB plugin (and re-index) |
| `--no-write` | off | analyze but skip writing the corpus |
| `-d, --dry-run` | off | segment + print plan only (no LM Studio) |

## Failure handling

A slice whose output fails the schema saves the raw output to `story-distiller\.failures\` and
keeps the previous slate (a bad parse never corrupts continuity). The runner tolerates
reasoning-preambles and truncated JSON (fence/leading-text/strip, trailing-comma and unmatched-
brace repair); if a story still yields nothing it is reported as failed and the batch continues.

## Testing policy

All testing happens on this mirror (`E:\lmstudio_mirror`). Quit the other install's LM Studio
first and run this repo's `install.bat` / `Launch-LM-Studio.ps1` to bring the junctions here.
Source of truth is `src/`; `dist/` is generated and git-ignored. Verify with `npm run typecheck`,
then `--dry-run` (no model), then a real run and confirm the corpus folder appears.
