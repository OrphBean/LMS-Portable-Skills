# LM Studio skill conventions (khtsly plugin)

What LM Studio's skills plugin actually reads, so a skill is not silently
mis-parsed. Follow these for every skill in this package.

## Skill discovery

- A skill = one directory directly under a configured skillsPath. Each must
  contain `SKILL.md` (required) and `skill.json` (optional but recommended).
- The plugin scans immediate subdirectories only; nested folders are not
  auto-discovered.
- `skillsPath` is set in LM Studio (Settings → extensions → skills). Here it
  points at `.agents/skills` (mirrored to `J:\lmstudioPortable\.agents\skills`).

## Routing (BM25) — what the model searches

Weighted, high to low: `name` (3.0), `tags[]` (2.5), `description` (1.5),
SKILL.md body excerpt (0.8). The body excerpt = first ~2000 chars of the body
**after** the `# Title` heading and the one-line description, with markdown
stripped.

Consequence: `name` and `tags[]` dominate. Write `tags[]` deliberately. Put the
most reusable prose at the very top of the SKILL.md body.

## The two things the model always sees

1. **`<available_skills>` list** — when auto-inject is on, up to
   `maxSkillsInContext` (default 15) skills shown as `<skill>` blocks with
   `<name>`, `<description>`, `<location>`. Skills beyond that are found via
   `list_skills(query)`.
2. **`bodyExcerpt` / full body** — the excerpt is searchable; the full body is
   loaded only when the model calls `read_skill_file` (or `/skill-name` is
   written in the message, which expands the full body into `<skill_context>`).

## SKILL.md format — CRITICAL, no YAML frontmatter

The parsers `extractDescription` / `extractBodyExcerpt` assume:

```
# <skill-name>
Use when <one line trigger>. <optional more>.

---
## <sections start here>
```

They do **not** parse YAML frontmatter (`---\nname: ...`). Feed them
opencode-frontmatter and the `---`, `name:`, `description:` lines leak into the
description, giving garbage routing. Always start with an H1 and a "Use when"
line.

## Defaults and limits

- `description` ≤ 500 chars (truncated silently).
- body excerpt ≈ first 2000 chars; full file read capped at 100 KB (middle cut).
- skill dir depth ≤ 3, ≤ 200 entries.
- `hasExtraFiles` is true if the dir contains anything besides `SKILL.md` /
  `skill.json` — use it to signal `references/` / `scripts/`, then the model
  calls `list_skill_files`.

## Available tools (use them, don't shell out)

`list_skills` (search), `read_skill_file` (read any skill file; default
SKILL.md), `list_skill_files`, `read_file` / `write_file` / `patch_file` /
`append_to_file`, `create_directory`, `list_directory`, `delete_file`,
`move_file`, `rename_file`, `run_command`. Prefer these over raw shell for
file work. Use `run_command` for deterministic scripts (e.g. the validator).
