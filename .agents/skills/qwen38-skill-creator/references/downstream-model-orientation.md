# Downstream generation-model orientation

Design-time reference for the compiler. Compiled skills that produce prompts
for generation models are primed for the three primary targets — MiniMax H3
(video), FLUX Klein 9B (image), and Krea 2 (image). This file records each
model's disposition at ORIENTATION level. The exact syntax lives in the
dedicated skill families (h3-*, flux-klein-*, krea2-*) and must NOT be copied
into this creator or into genre overlays.

All three share the screenwriter's frame (see screenwriting-discipline.md).

## MiniMax H3 — video

- The prompt is a temporal timeline, not a still: what happens, in what order,
  how movement develops, how subjects physically respond, how the camera
  behaves, how the shot concludes.
- Prefer observable audiovisual events over abstract intent. `She hesitates at
  the doorway, looks back over her shoulder, then slowly enters as the camera
  tracks behind her.` over `The scene conveys uncertainty and apprehension.`
- Duration and aspect ratio are the only output parameters. Shape the amount of
  action to fit the duration; never write a 5-second prompt needing 30 seconds.
- Camera movement, shots, and cuts are part of the scene language; cross
  dissolves or wipes only when requested.
- Reasoning mode: `instruct` or `medium` for simple motion; `thinking` for
  complex biomechanical decomposition.

## FLUX Klein 9B — image

- Natural-language prose, one coherent description — not a keyword dump.
- No conventional negative prompt. Translate avoidances into the desired
  visible state (`no blur` → `tack-sharp focus`); negation stays allowed when
  it is the clearest expression.
- Front-load the main subject and its defining action; supporting detail later.
  Word order signals priority.
- Roughly 30–80 words; Klein does no prompt upsampling, so only include detail
  that changes the image.
- Lighting is high impact: name the source and quality when it matters; do not
  default to golden hour or rim light.
- Photographic technical language (shot size, angle, focal-length impression,
  depth of field) only when it serves visible intent; never a bare camera body
  or aperture number.
- Reasoning mode: `instruct`.

## Krea 2 — image

- One natural-language paragraph; faithful expansion that preserves subject,
  action, colours, spatial relations, and medium.
- Positive-only realism cues: texture and imperfection instead of polish
  (`natural skin texture, visible pores`, `flyaway hairs`, `slight motion
  blur`, `film grain`).
- Explicit light source and quality; one dominant subject and one clear
  action; camera/lens language as semantic cues, not metadata.
- Respect unusual, imperfect, raw, historical, analogue directions; do not
  impose a generic polished AI aesthetic.
- Reasoning mode: `instruct`.

## Shared photographic-realism orientation

Across all three targets, compiled skills ground the visual language in:

- real human subjects with anatomical plausibility, weight, posture, and
  natural micro-behaviour;
- concrete cause and effect — every action has a visible consequence;
- motion logic and continuity — no teleporting, temporally legible sequence,
  matching action across cuts;
- screen direction — consistent sides, direction of travel, and eye-lines.

See screenwriting-discipline.md for the full rules.

## What NOT to embed here or in compiled skills

- API parameters, sampling values, seeds, resolutions, FPS, model IDs,
  endpoints, or negative-prompt blocks. H3 keeps only duration and aspect
  ratio; Klein and Krea 2 output prompt text only.
- Production-workflow architecture (asset pipelines, rendering orchestration,
  ComfyUI node wiring, approval flows). The specific skill families handle
  what they need; this creator stays orientation-level.
