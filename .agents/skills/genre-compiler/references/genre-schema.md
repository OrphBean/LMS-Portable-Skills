# Genre schema — canonical field contract

Every `genre-*` skill is a single LM Studio skill directory. This is the
contract. The `genre-compiler` enforces it; `scripts/validate_genres.py`
checks it.

## Layout

```
genre-<slug>/
  skill.json
  SKILL.md
  references/<slug>-source.md   # original verbose doc, on-demand only
```

## skill.json

```json
{
  "name": "genre-<slug>",
  "description": "<500 chars, trigger-rich: Use when ... ; Do NOT use for ... >",
  "tags": [
    "format:35mm", "period:1970s", "camera:zoom",
    "color:chroma-bleed", "mood:melancholy"
  ]
}
```

- `name` — the directory basename, kebab-case `genre-<slug>`.
- `description` — ≤500 chars. Must begin `Use when <trigger>.` and end with
  a `Do NOT use for <opposites>` clause naming the correct alternative genre
  where applicable.
- `tags` — **required**, the BM25 routing surface (weight 2.5). Pack the axes:
  `format`, `period`, `camera`, `color`/`grade`, `motion`, `mood`. Use
  `axis:value` tokens so both `format:vhs` and `vhs` match.

## SKILL.md body — required sections in this order

`# <name>` (no YAML frontmatter), then a single "Use when …" line, then `---`,
then:

1. `## Style reference block` — **one** splice-ready prose passage (~400–900
   chars), directly usable inside an H3 `integrated_multimodal_description`.
   Authoritative; the model drops this in verbatim-ish, then adapts. Keep it in
   the first ~2000 chars so the LM auto-excerpt carries it.
2. `## Trait schema` — a compact, consistent table mapping the shared
   attributes: capture, color/grade, camera & lens, framing/composition,
   lighting, production design, staging/performance, editing/temporal, audio.
3. `## Exclusions` — the "do not use" list, phrased as desired visible states
   where possible (positive), and the outright forbidden words/techniques.
4. `## Example` — one worked prompt fragment showing the prose block in use.

Keep capture/format and period facts as **constrains the compiler should not
invent** — only extract what the source states.

## Composability principle

One genre skill = one dominant style family + at most one secondary influence.
A genre directory must never blend many styles; blend only by loading a second
`genre-*` skill and marking one secondary.
