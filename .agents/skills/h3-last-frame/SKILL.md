---
name: h3-last-frame
description: Build a MiniMax H3 final-frame-conditioned (L2VA) prompt that converges onto a supplied final image. Use when a supplied image defines the required ending visual state. Do NOT use when the image is the opening frame (h3-i2v), an endpoint pair (h3-first-last), or guidance-only (h3-reference).
---

# H3 LAST-FRAME prompt

## Purpose

Produce a video that converges onto a supplied final frame. Reason backward
enough to infer a plausible preceding state, then describe forward-moving
action that lands on the image.

## Reasoning mode

`instruct` — deterministic converge-forward construction from an explicit procedure.

## Inputs / semantic interpretation

- Picture 1: the required FINAL state. It belongs to the last `[Shot N]`, not
  to the opening.
- Creative request: the intent that shapes the preceding action.

## Hard requirements

- The alignment instruction must be the first line of the prompt body
  (immediately after the `key: value` header block and its blank line),
  followed by one blank line:

  `How the reference pictures align with the target video — <Picture 1> (from [Shot N]) aligns with the S.SS-second mark of the target video.`

  Where `N` is the index of the actual final shot and `S.SS` is the effective
  duration formatted to exactly two decimal places.
- Then the three core fields in order, separated by blank lines:
  `integrated_multimodal_description`, `overall_soundscape`,
  `non_diegetic_music`.
- The image belongs to the END of the sequence. Never describe it as the
  opening frame.
- Follow the structure: plausible preceding state → explicit action and
  transition path → gradual convergence in the final shot → last-frame landing.
- The inferred preceding state must be compatible with the final state (same
  subject, plausible continuity) and grounded in the user's intent.
- The final shot must land on the image's composition, subject state, camera
  state, and lighting.
- Do not invent an earlier state that contradicts the image.

## Core fields

Write the prompt body as three labeled fields, in this order, separated by
blank lines:

- `integrated_multimodal_description:` — everything visible and audible along
  the timeline: style, shots, subjects, actions, dialogue, singing, and
  diegetic sound.
- `overall_soundscape:` — ambient and physical sound across the whole video
  (wind, rain, traffic, footsteps, fabric, impacts, breathing, laughter). 1–4
  sentences in one continuous paragraph. Do not repeat dialogue, singing, or
  diegetic music. Use `N/A` only for explicit complete silence.
- `non_diegetic_music:` — music only the audience can hear (characters cannot).
  1–3 sentences naming instrumentation, tempo, rhythm, and dynamics; no abstract
  mood words. Use `N/A` when there is none.

Do not invent dialogue, singing, or music to fill a field. If the user requests
silence, honour it.

## Shots and cuts

- `[Shot 1]` opens the body with no timestamp. State the overall style first
  (for example `Live-action, cinematic,`, `2D-animated,`, `claymation,`,
  `watercolor,`, `vintage film,`), then composition, subjects, environment,
  action, camera, and sound.
- Later shots: `[Shot 2] At 00:03.500, the camera cuts to ...` Cut times
  strictly increase and must fall inside the duration. Use `cuts to`,
  `transitions to`, or `switches to`. Cross-dissolve, fade, or wipe only when
  the user requests them. If only distance or angle changes, prefer camera
  motion over a cut. A cut should introduce new information about subject,
  space, state, viewpoint, or time.

## Camera language

Write camera movement as natural English inside the shot: motion type, plus
`with small amplitude` / `with large amplitude` and `at slow speed` / `at fast
speed` only when meaningful. Types: Zoom In/Out, Push In/Pull Out, Pan
Left/Right, Truck Left/Right, Tilt Up/Down, Pedestal Up/Down, Arc Shot,
Tracking Shot, Static Shot, Shake Slightly/Strongly, POV, Roll
Clockwise/Counterclockwise.

`The camera pushes in with small amplitude at slow speed toward the folded letter in her hands.`

## Speakers and dialogue

- Assign stable IDs to everyone who speaks or sings: `(S1)`, `(S2)`; `(S1,S2)`
  when they speak together. Silent characters get no ID. IDs persist across
  shots.
- At first appearance, establish identity from visual and audio context
  (character type, age, voice quality, delivery).
- Keep the identifying phrase, ID, action, and delivery OUTSIDE `<d>`. Inside
  `<d>` put only the language tag and the verbatim spoken words. Preserve every
  word and punctuation; never translate.

`The young woman (S1) says: <d>[English] I get off at the next station.</d>`

- Voiceover: use exactly `says in an off-screen voiceover`, then after the
  `<d>` block state that the character's lips remain completely closed.
- Dialogue crossing a cut: mark both parts with `<scenetrans>` and state that
  the audio continues across the cut. Speech cut off by the video end: mark
  with `<cutoff>`.
- Singing follows the same ID and `<d>` rules.

## On-screen text

Put visible signs, banners, subtitles, or neon text in English double quotation
marks, verbatim, original language preserved.

`A red neon sign reading "营业中" glows above the doorway.`

## Decision rules

- Reason backward only as far as needed: infer a preceding state that the
  final frame implies, without adding contradictory backstory.
- Keep the convergence gradual in the final shot; do not snap to the image in
  the last word.

## Motion discipline

- **Cause → effect.** Every action states its visible physical consequence: the push moves the door, the footfall raises dust, the stop settles the coat. Never write an action that hangs with no visible result.
- **No teleporting.** Positions, poses, objects, and the camera change through plausible intermediate states between frames and across cuts. The approach to the final frame is a continuous physical path, not a jump or a crossfade.
- **Screen direction.** Keep each subject's screen side, direction of travel, and eye-lines consistent across cuts. Entering left and exiting right reads as a reversal — write it only when meant.
- **Motivated camera.** Every camera move is explainable from the action: a push-in follows a glance, a pan follows a moving subject. No unmotivated drift.
- **Count ratios beat adjectives.** Convert relative speed or energy differences into a countable ratio the model can hold: `for every 3 actions by A, B completes 1` instead of `A is faster than B`.
- **Named patterns.** For non-trivial motion, name the transition pattern the camera performs — `foreground occlusion transition`, `anchor-flow`, `close-range orbit`, `hero-shot hold` — rather than only describing movement toward a subject. Naming the pattern prevents H3's default of cutting, flying, or freezing.
- **Grounded bodies.** Subjects carry weight, jointed movement, and natural micro-behaviour (breathing, blinking, hesitation). No mannequin poses, no weightless motion.

## Priority

1. explicit user requirements; 2. reference-preservation constraints; 3. H3
format requirements; 4. active genre/cinematography/narrative overlays; 5.
creative embellishment. Creative embellishment never overrides items 1–3.

## Creative freedom

You choose how the approach plays out, the intermediate motion, secondary
detail, and cinematic phrasing. The required final state and convergence onto
Picture 1 outrank embellishment.

## Output contract

mode: last-frame
duration: 6
aspect_ratio: 16:9

How the reference pictures align with the target video — <Picture 1> (from [Shot N]) aligns with the S.SS-second mark of the target video.

integrated_multimodal_description: ...

overall_soundscape: ...

non_diegetic_music: ...

- `mode`: always `last-frame`.
- `duration`: effective length in seconds. Keep the user's value; if none, use
  6 seconds. `S.SS` in the alignment line equals this value to two decimal
  places.
- `aspect_ratio`: keep the user's value; else `16:9`. May inform framing only.
- After the blank line: the complete H3 text, starting with the alignment line,
  then the three core fields in order. Nothing else.

Output plain text only: the `key: value` header lines, a blank line, then the
prompt body. No JSON, no markdown, no preamble, no explanation, no reasoning.
No tool calls are made; this skill produces prompt text only.

## Failure modes

- Last-frame confusion: describing the image as the opening state.
- An inferred preceding state that contradicts the final image.
- Convergence that is abrupt instead of gradual.
- A `S.SS` that does not match the duration.

## Final validation

Confirm: the alignment line is first and exact; the image is only described as
the final state; the preceding state is compatible and grounded in intent;
convergence is gradual and complete in the final shot; the output matches the
contract.
