# genre-compiler

Use when asked to turn a verbose genre/style document into a conforming LM-native genre skill (a `genre-*` skill directory). Compiles long prose reference material into a compact `skill.json` + `SKILL.md`, so the genre becomes routable and loadable on demand under LM Studio. Read `references/genre-schema.md` and `references/skill-conventions.md` before compiling anything. Do NOT use for writing the development/pre-prompt layer, for building H3 prompt syntax, or for editing an existing genre skill by hand — recompile instead.

---

## Reasoning mode

`instruct` — deterministic, rules-driven extraction. No reasoning trace needed. This is a compile/refactor task; do not over-think it.

## Inputs

- A verbose genre/style source document (prose or structured: a `*_styles.md`, a `*_style_reference.md`, a written brief).
- The target slug (e.g. `vampire-erotic-gothic`) and a one-line genre identity.

## The genre schema (what every genre skill must contain)

Every compiled genre skill is a directory with:

- `skill.json` — `name` (slug), `description` (≤500 chars, trigger-rich), `tags[]` (the BM25 routing surface).
- `SKILL.md` — `# <name>`, a "Use when …" one-liner, then the compiled genre body.
- `references/<slug>-source.md` — the original verbose source, kept for on-demand depth.

The `SKILL.md` body must cover the canonical field contract in `references/genre-schema.md`: capture/substrate, color & grade, camera & lens, framing/composition, lighting, production design, staging & performance, editing/temporal, audio/soundscape, exclusions, and one worked example.

## Compilation passes

1. **Identify the single dominant style family.** Pick ONE primary family from the source that best matches the user's intent, not a blend.
2. **Extract the shared substrate** (capture/format/period clues) — the constant, not the variant.
3. **Extract the per-family trait columns** from the schema: grade, camera, framing, lighting, production, staging, editing, audio.
4. **Write the splice-ready style-reference prose block** (~400–900 chars). This is a single authoritative passage, in the style of a MiniDV overlay: opening style statement, capture character, camera behaviour, colour/grade, lighting, production, one exclusions clause. It must be directly usable inside an H3 `integrated_multimodal_description`.
5. **Assemble the SKILL.md** so the most reusable content (Use when + the prose block + core rules) falls in the first ~2000 chars (the LM auto-excerpt).
6. **Emit the skill directory** with `write_file` / `create_directory`. Preserve the source verbatim in `references/<slug>-source.md` (use `copy` via `run_command` if a source file already exists on disk).

## Description and tags rules (critical for routing)

- `description` ≤500 chars: `Use when <what the genre is / when to apply it>. <2-4 concrete signatures>. Do NOT use for <the strong opposites>; use genre-<other> instead.`
- `tags[]`: pack with the attribute axes a user may query — `format` (35mm, 4:3, VHS, digital), `period` (1970s, 1990s, early-2000s), `camera` (handheld, zoom, dolly, static), `color`/`grade` (saturated, high-key, low-key, chroma bleed), `motion`, `mood`. Weight is 2.5 in routing, so tags matter as much as name.

## Output contract

Produce one genre skill directory. Output plain text confirming: the created path, the dominant family chosen, the secondary influence (none unless the source demands it), and the `skill.json` description. No JSON envelope, no preamble, no tool-call XML. Keep `1 dominant family + at most 1 secondary influence` — never blend many.

## Validation

After emitting, run `scripts/validate_genres.py` (via `run_command`) to confirm the skill conforms. Fix anything it flags before reporting done.

## Failure modes

- Compiling a blend of several styles instead of one dominant family.
- Leaking YAML frontmatter into the skill (LM Studio can't parse it) — the SKILL.md must start with `# <name>`.
- A `description` over 500 chars being silently truncated.
- Missing `tags[]` (kills BM25 routing beyond the top-15 auto-injected list).
- Putting the verbose source only in the SKILL.md instead of `references/` (defeats token-efficiency).
