# h3-t2v
Use when Build a MiniMax H3 text-to-video (T2VA) prompt from a textual creative request. Use when no supplied image acts as a required first or final frame. Do NOT use when an image must be the literal opening frame (h3-i2v), an endpoint pair (h3-first-last), the final frame (h3-last-frame), or a full-reference rewrite (h3-reference).

---

## Purpose

Turn a textual creative request into a complete H3 audiovisual timeline. The
video is generated from text; no image pins a boundary frame.

## Reasoning mode

`instruct` â€” deterministic timeline construction from an explicit procedure.

## Inputs / semantic interpretation

- Creative request: the sole authority for facts, subjects, action, and
  narrative.
- Non-boundary references (one style image, a mood note): informative only.
  Weave their identity or style into the description. Never add an
  image-alignment line; that would switch the mode.
- Active genre/cinematography/narrative overlays: contribute visual language,
  colour, lighting, performance, and camera conventions.

## Hard requirements

- Begin directly with `integrated_multimodal_description:`. T2VA has no
  alignment-instruction line.
- Write the three core fields in order, separated by blank lines:
  `integrated_multimodal_description`, `overall_soundscape`,
  `non_diegetic_music`.
- Make every detail correspond to something visible or audible along a clear
  timeline: what happens, in what order, how movement develops, how subjects
  physically respond, how the camera behaves, how the shot concludes.
- Fit the number and pace of events to the duration. A 5-second prompt must not
  contain a sequence that needs 30 seconds.
- Do not invent dialogue, singing, or music where silence or unspecified audio
  is more appropriate.
- Preserve explicit user facts exactly.

## Core fields

Write the prompt body as three labeled fields, in this order, separated by
blank lines:

- `integrated_multimodal_description:` â€” everything visible and audible along
  the timeline: style, shots, subjects, actions, dialogue, singing, and
  diegetic sound.
- `overall_soundscape:` â€” ambient and physical sound across the whole video
  (wind, rain, traffic, footsteps, fabric, impacts, breathing, laughter). 1â€“4
  sentences in one continuous paragraph. Do not repeat dialogue, singing, or
  diegetic music. Use `N/A` only for explicit complete silence.
- `non_diegetic_music:` â€” music only the audience can hear (characters cannot).
  1â€“3 sentences naming instrumentation, tempo, rhythm, and dynamics; no abstract
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

`A red neon sign reading "è¥ä¸šä¸­" glows above the doorway.`

## Temporal and cinematic language

- Prefer observable audiovisual events over abstract intent. Prefer `She hesitates at the doorway, looks back over her shoulder, then slowly enters as the camera tracks behind her.` over `The scene conveys uncertainty and apprehension.` Abstract mood may supplement observable action, never replace it.
- Use cinematic terms (shot size, framing, angle, lens impression, movement, focus, depth, lighting, blocking, pacing, transition, sound) only where they add precision. Do not overload.

## Motion discipline

- **Cause â†’ effect.** Every action states its visible physical consequence: the push moves the door, the footfall raises dust, the stop settles the coat. Never write an action that hangs with no visible result.
- **No teleporting.** Positions, poses, objects, and the camera change through plausible intermediate states between frames and across cuts.
- **Screen direction.** Keep each subject's screen side, direction of travel, and eye-lines consistent across cuts. Entering left and exiting right reads as a reversal â€” write it only when meant.
- **Motivated camera.** Every camera move is explainable from the action: a push-in follows a glance, a pan follows a moving subject. No unmotivated drift.
- **Count ratios beat adjectives.** Convert relative speed or energy differences into a countable ratio the model can hold: `for every 3 actions by A, B completes 1` instead of `A is faster than B`.
- **Named patterns.** For non-trivial motion, name the transition pattern the camera performs â€” `foreground occlusion transition`, `anchor-flow`, `close-range orbit`, `hero-shot hold` â€” rather than only describing movement toward a subject. Naming the pattern prevents H3's default of cutting, flying, or freezing.
- **Grounded bodies.** Subjects carry weight, jointed movement, and natural micro-behaviour (breathing, blinking, hesitation). No mannequin poses, no weightless motion.

## Decision rules

- Where the user leaves a detail open, make a concrete, consistent choice
  rather than leaving the prompt vague.
- If a supplied image is meant to be the literal opening or final frame, stop:
  this is not t2v. Route to i2v / first-last / last-frame.

## Priority

1. explicit user requirements; 2. reference-preservation constraints; 3. H3
format requirements; 4. active genre/cinematography/narrative overlays; 5.
creative embellishment. Creative embellishment never overrides items 1â€“3.

## Creative freedom

You choose secondary visual detail, natural movement, atmospheric detail,
cinematic phrasing, shot-level embellishment, and transition dynamics â€” within
the user's facts, the requested action, and the duration.

## Output contract

mode: t2v
duration: 5
aspect_ratio: 16:9

integrated_multimodal_description: ...

overall_soundscape: ...

non_diegetic_music: ...

- `mode`: always `t2v`.
- `duration`: effective length in seconds. Keep the user's value; if none, use
  5 seconds. All cut times must fall within it.
- `aspect_ratio`: keep the user's value; else `16:9`. May inform framing only.
- After the blank line: the complete H3 text, starting directly with
  `integrated_multimodal_description:` and containing the three fields in
  order. Nothing else.

Output plain text only: the `key: value` header lines, a blank line, then the
prompt body. No JSON, no markdown, no preamble, no explanation, no reasoning.
No tool calls are made; this skill produces prompt text only.

## Failure modes

- Adding an image-alignment line (mode leak into i2v).
- Describing a static image instead of a temporal sequence.
- Overloading a short duration with too many events.
- Field-order or label errors in the three core fields.

## Final validation

Confirm: no alignment line; the three fields present in order; every explicit
user constraint appears; each event is observable and timed plausibly within
the duration; no invented dialogue or music; the output matches the contract.
