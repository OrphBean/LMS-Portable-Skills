---
name: h3-i2v
description: Build a MiniMax H3 image-to-video (I2VA) prompt where the supplied image is the literal opening frame. Use when a supplied image is the authoritative starting visual state of the video. Do NOT use when the image defines only the ending (h3-last-frame), both endpoints (h3-first-last), or is guidance-only (h3-reference).
---

# H3 I2V prompt

## Purpose

Develop a video forward from a supplied opening frame. The image is the actual
first frame of the video and the authoritative starting visual state.

## Reasoning mode

`instruct` — deterministic develop-forward construction from an explicit procedure.

## Inputs / semantic interpretation

- Picture 1: the literal first frame at 0.00 seconds, belonging to `[Shot 1]`.
  It is the identity, appearance, environment, and initial-composition source,
  unless the user assigns it a narrower role.
- Creative request: what happens next, and what the user wants changed.
- Active genre/cinematography/narrative overlays: visual language, camera
  conventions, performance.

## Hard requirements

- The alignment instruction must be the first line of the prompt body
  (immediately after the `key: value` header block and its blank line),
  followed by one blank line:

  `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.`

- Then the three core fields in order, separated by blank lines:
  `integrated_multimodal_description`, `overall_soundscape`,
  `non_diegetic_music`.
- `[Shot 1]` must first anchor on what is in the image (style, subjects,
  composition, scene anchors), then describe the next action.
- Follow the structure: first-frame anchor → action onset → continuous
  development → result or reaction.
- Describe movement FORWARD from the opening state. Never invent or describe an
  earlier state before the image.
- Preserve, animate, and change per the rules below. Change only what the
  requested transformation requires; do not redesign the reference content.
- All cut times fall within the duration.

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

## Preserve / Animate / Change

- **Preserve by default** wherever the user has not requested change: subject
  identity, facial identity, clothing, environment, object identity, initial
  spatial relationships, initial composition, lighting, colour, texture.
- **Animate**: subject movement, facial/performance movement, object movement,
  environmental response, natural secondary motion, and camera motion where
  requested.
- **Change**: only the attributes or states required by the requested
  transformation. Leave everything else as established by the image.

## Motion discipline

- **Cause → effect.** Every action states its visible physical consequence: the push moves the door, the footfall raises dust, the stop settles the coat. Never write an action that hangs with no visible result.
- **No teleporting.** Positions, poses, objects, and the camera change through plausible intermediate states between frames and across cuts.
- **Screen direction.** Keep each subject's screen side, direction of travel, and eye-lines consistent across cuts. Entering left and exiting right reads as a reversal — write it only when meant.
- **Motivated camera.** Every camera move is explainable from the action: a push-in follows a glance, a pan follows a moving subject. No unmotivated drift.
- **Count ratios beat adjectives.** Convert relative speed or energy differences into a countable ratio the model can hold: `for every 3 actions by A, B completes 1` instead of `A is faster than B`.
- **Named patterns.** For non-trivial motion, name the transition pattern the camera performs — `foreground occlusion transition`, `anchor-flow`, `close-range orbit`, `hero-shot hold` — rather than only describing movement toward a subject. Naming the pattern prevents H3's default of cutting, flying, or freezing.
- **Grounded bodies.** Subjects carry weight, jointed movement, and natural micro-behaviour (breathing, blinking, hesitation). No mannequin poses, no weightless motion.

## Decision rules

- A request to "enhance" or "make cinematic" operates AROUND the preserved
  scene; it does not redesign the image's content.
- If the image is not meant to be the opening frame, this is not i2v — route to
  h3-reference or h3-last-frame.

## Priority

1. explicit user requirements; 2. reference-preservation constraints; 3. H3
format requirements; 4. active genre/cinematography/narrative overlays; 5.
creative embellishment. Creative embellishment never overrides items 1–3.

## Creative freedom

You choose natural movement, secondary detail, atmospheric response, camera
motion (when requested and its detail is unspecified), and cinematic phrasing.
The image's preserved attributes and the user's requested change outrank
embellishment.

## Output contract

mode: i2v
duration: 5
aspect_ratio: 16:9

For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: ...

overall_soundscape: ...

non_diegetic_music: ...

- `mode`: always `i2v`.
- `duration`: effective length in seconds. Keep the user's value; if none, use
  5 seconds.
- `aspect_ratio`: keep the user's value; else `16:9`. May inform framing only.
- After the blank line: the complete H3 text, starting with the alignment line,
  then the three core fields in order. Nothing else.

Output plain text only: the `key: value` header lines, a blank line, then the
prompt body. No JSON, no markdown, no preamble, no explanation, no reasoning.
No tool calls are made; this skill produces prompt text only.

## Failure modes

- Treating the image as a generic reference instead of the literal opening
  frame (first-frame confusion).
- Describing a state before the image (backward leak).
- Redesigning preserved attributes during "enhancement".
- Missing or misplacing the alignment line.

## Final validation

Confirm: the alignment line is the first line; `[Shot 1]` anchors on the image
before acting; no earlier state is described; preserved attributes are
unchanged unless requested; the requested change is present; all events move
forward within the duration; the output matches the contract.
