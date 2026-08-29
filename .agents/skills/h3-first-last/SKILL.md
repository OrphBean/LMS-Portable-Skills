---
name: h3-first-last
description: Build a MiniMax H3 first-frame + last-frame (FL2VA) prompt that transitions between a required opening image and a required final image. Use when two images define the required beginning and ending states. Do NOT use for a single opening frame (h3-i2v), a single final frame (h3-last-frame), or guidance-only references (h3-reference).
---

# H3 FIRST-LAST prompt

## Purpose

Generate a plausible continuous transition between a required first frame and a
required final frame.

## Reasoning mode

`instruct` — deterministic interpolation-path construction from an explicit procedure.

## Inputs / semantic interpretation

- Picture 1: the required first state at 0.00 seconds.
- Picture 2: the required final state at the end of the video.
- Creative request: what the transition should express and any movement
  constraints.

## Hard requirements

- The alignment instruction must be the first line of the prompt body
  (immediately after the `key: value` header block and its blank line),
  followed by one blank line:

  `How the reference pictures align with the target video — <Picture 1> (from [Shot 1]) aligns with the 0.00-second mark of the target video; <Picture 2> (from [Shot N]) aligns with the S.SS-second mark of the target video.`

  Where `N` is the index of the actual final shot and `S.SS` is the effective
  duration formatted to exactly two decimal places.
- Then the three core fields in order, separated by blank lines:
  `integrated_multimodal_description`, `overall_soundscape`,
  `non_diegetic_music`.
- The body must describe the MOTION PATH between the endpoints, not two static
  image descriptions.
- Follow the structure: first-frame state → observable intermediate changes →
  progressively narrowing differences → last-frame state.
- The final shot must land exactly on Picture 2 at the end of the video.
- Prefer a single continuous shot so the model interpolates naturally. Use
  multiple shots only when they are explicitly specified.
- Preserve endpoint identity, composition, and other endpoint requirements
  from the references.
- Creative embellishment must never prevent convergence on the required final
  state.

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

- When the user requests multiple shots in first-last mode, keep each shot
  moving toward Picture 2; the last `[Shot N]` must still land on it.
- If the two images are to be read as boundary frames, keep their roles; a
  genre or creative overlay must not shift the endpoints.

## Motion discipline

- **Cause → effect.** Every action states its visible physical consequence: the push moves the door, the footfall raises dust, the stop settles the coat. Never write an action that hangs with no visible result.
- **No teleporting.** Positions, poses, objects, and the camera change through plausible intermediate states between frames and across cuts. The transition is a continuous physical path, not a jump or a crossfade between two stills.
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

You choose the intermediate motion, transition dynamics, secondary detail, and
cinematic phrasing between the endpoints. The required start and end states,
and convergence onto Picture 2, outrank embellishment.

## Output contract

mode: first-last
duration: 8
aspect_ratio: 16:9

How the reference pictures align with the target video — <Picture 1> (from [Shot 1]) aligns with the 0.00-second mark of the target video; <Picture 2> (from [Shot N]) aligns with the S.SS-second mark of the target video.

integrated_multimodal_description: ...

overall_soundscape: ...

non_diegetic_music: ...

- `mode`: always `first-last`.
- `duration`: effective length in seconds. Keep the user's value; if none, use
  8 seconds. `S.SS` in the alignment line equals this value to two decimal
  places.
- `aspect_ratio`: keep the user's value; else `16:9`. May inform framing only.
- After the blank line: the complete H3 text, starting with the alignment line,
  then the three core fields in order. Nothing else.

Output plain text only: the `key: value` header lines, a blank line, then the
prompt body. No JSON, no markdown, no preamble, no explanation, no reasoning.
No tool calls are made; this skill produces prompt text only.

## Failure modes

- Writing two static image descriptions instead of a motion path.
- Misaligning the endpoint marks (wrong shot index or a `S.SS` that does not
  match the duration).
- Multiple unrequested cuts that break continuous interpolation.
- The final shot failing to converge on Picture 2.

## Final validation

Confirm: the alignment line is first and exact; the motion path is described,
not two statics; the single-shot preference is honoured unless the user asked
for cuts; the final shot lands on Picture 2 at the duration; the output matches the
contract.
