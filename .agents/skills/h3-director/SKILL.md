---
name: h3-director
description: Route a MiniMax H3 video-prompt request to exactly one modality skill and produce the final plain-text prompt. Use when asked to create a prompt for MiniMax H3 video generation. Do NOT use for actual generation or API calls, for non-H3 video tools, or for editing prompts outside a generation request.
---

# H3 Director

## Purpose

Determine which H3 prompting modality applies, load exactly one main modality
skill, apply any active genre/cinematography/narrative overlays, resolve
duration and aspect ratio, and assemble the final plain-text prompt.

## Reasoning mode

`instruct` — pure routing and assembly. No reasoning trace needed.

## Inputs

- Creative request (text).
- Attached references: images, videos, audio.
- Optional duration and aspect ratio.
- Any active genre/cinematography/narrative skills.

## Decision rules

Route by the strongest boundary signal in the input:

- **t2v** — no supplied image acts as a required first or final frame. The
  video is generated from textual intent, optionally informed by non-boundary
  reference information.
- **i2v** — a supplied image is the literal opening frame / authoritative
  starting visual state of the video.
- **first-last** — two images define the required beginning and required
  ending states; generate a plausible continuous transition between them.
- **last-frame** — a supplied image defines the required final state; the
  preceding action must converge onto it.
- **reference** — one or more assets provide information (identity,
  appearance, composition, camera, motion, trajectory, performance, style,
  temporal structure, storyboard planning, audio) without serving as literal
  boundary frames.

Ambiguity rules:

- An image the user names as start/opening/first frame, or asks to "animate",
  is a boundary frame → `i2v`.
- An image explicitly named as the final/ending frame → `last-frame` (alone) or
  `first-last` (with a second opening image).
- If it is unclear whether an image is a boundary frame or guidance-only,
  choose the boundary interpretation (`i2v`) unless the user's words clearly
  describe guidance-only use (for example "for style" or "as appearance
  reference").
- Non-boundary reference assets never force a mode change. A single incidental
  reference (for example one style image) is consumed inside whichever mode is
  active; a multi-asset or multi-role reference set with no boundary frame uses
  `reference`.

Load exactly one modality skill. Apply active genre/cinematography/narrative
overlays on top; they must never override user facts or reference authority.

## Overlay routing

Load a named overlay alongside the modality skill only when the request calls
for its domain. Each overlay stays subordinate to the modality skill, user
facts, and reference authority:

- **h3-motion-continuity** — when body mechanics, causal action chains, weight
  transfer, or continuity across cuts matter. Governs motion, interaction,
  world-state persistence, and camera trajectory language inside the shot.
- **h3-style-minidv-camcorder** — when the user wants the early-2000s MiniDV
  camcorder look, handheld motion, optical-zoom behaviour, and audio character.

Do not invent an overlay that was not requested. An overlay changes the prompt
language, never the modality or the resolved duration/aspect ratio.

## Resolve duration and aspect ratio

- **duration**: keep the user's explicit value. If none is given, use the mode
  default — t2v 5s, i2v 5s, first-last 8s, last-frame 6s, reference 10s — and
  shape the amount of action to fit it.
- **aspect_ratio**: keep the user's explicit value; otherwise `16:9`. Use it
  only to inform framing language.

## Priority

When rules conflict: 1) explicit user requirements; 2) reference authority and
preservation; 3) H3 format requirements; 4) active genre/cinematography/
narrative overlays; 5) creative embellishment. Creative embellishment never
overrides items 1–3.

## Output contract

Produce the modality skill's plain-text result, with the resolved mode:

mode: i2v
duration: 5
aspect_ratio: 16:9

<prompt text>

- `mode`: `t2v | i2v | first-last | last-frame | reference`.
- `duration`: effective length in seconds.
- `aspect_ratio`: the resolved ratio.
- After the blank line: the complete H3 prompt text for the selected modality. Nothing else.

Output plain text only: a header block of `key: value` lines (one per line),
followed by a blank line, followed by the prompt body. No JSON envelope, no
markdown, no preamble, no explanation, no reasoning. No tool calls are made;
this skill produces prompt text only.
