# h3-reference
Use when Rewrite a request plus one or more reference assets into MiniMax H3 full-reference (Ref2VA) format with reference labels, retention analysis, and a detailed description. Use when supplied assets provide guidance (identity, appearance, composition, camera, motion, trajectory, performance, style, temporal structure, storyboard planning, audio) without serving as literal boundary frames. Do NOT use when an image is only the opening frame (h3-i2v), an endpoint pair (h3-first-last), or the final frame (h3-last-frame).

---

## Purpose

Rewrite a request plus one or more reference assets into MiniMax's
full-reference format. Assign each asset a semantic role, define reference
labels, analyse retention, and write a detailed shot-by-shot description.

## Reasoning mode

`instruct` â€” reference-role assignment and label-stable rewrite from an explicit procedure.

## Inputs / semantic interpretation â€” reference roles

For every supplied asset, assign the roles the information actually provides.
An asset may hold several roles.

| Role | What it governs |
| --- | --- |
| identity source | who or what the subject is |
| appearance source | how the subject looks |
| literal frame source | a concrete frame or keyframe anchor |
| composition source | framing and layout |
| camera source | camera movement, angle, lens |
| movement source | how the subject moves |
| trajectory source | path and direction of motion |
| performance source | acting, expression, delivery |
| style source | visual style, palette, texture |
| temporal/editing source | cuts, rhythm, structure |
| storyboard/planning source | shot order, viewpoint, planning marks |
| audio source | sound, music, voice, timbre, sound effects |
| information-only | context that never becomes scene content |

Rules:

- A role must be earned by the user's description or the asset's evident
  purpose. Do not assume everything visible in an asset is a visible appearance
  source.
- **Non-visible metadata rule**: arrows, paths, labels, positional markers, and
  storyboard marks are planning metadata. Convert them into natural scene
  behaviour (movement, direction, spatial relationship, timing, endpoint,
  camera intent). Unless the user explicitly requests them as scene content,
  they must never become visible objects in the video.
- Boundary frames as the primary purpose are not this mode's job: when a
  supplied image's main role is to be the literal opening or final frame,
  route to h3-i2v / h3-first-last / h3-last-frame. Inside a reference rewrite,
  a `<Picture N>` may still act as a concrete keyframe or shot-planning
  anchor.

## Reference authority

Where several assets speak to the same attribute, each asset governs only its
assigned roles. For any attribute, follow the asset declared authoritative for
it; a lower-authority asset must not overwrite it outside its own role. If the
user states authority explicitly (for example "Picture 1 is authoritative for
appearance; Picture 2 only for movement"), preserve those roles exactly.

**Role segregation.** State what each asset controls AND what it does not
control. `Picture 2 is a cinematography reference: it governs camera, framing,
and lens, not character appearance, costume, or equipment structure.` An asset
with a narrow role must not leak into attributes outside it.

**Text drives the climax.** When a moment requires precise timed action (a
peak, a reveal, a hero shot timed to specific seconds), a composition or
camera reference can over-constrain the text. If the user asks for a text-led
climax, drop the camera reference from that beat and let the text be the sole
director; keep identity/appearance references active.

## Priority

1. explicit user requirements; 2. reference authority and preservation; 3. H3
format requirements; 4. active genre/cinematography/narrative overlays; 5.
creative embellishment. Creative embellishment never overrides items 1â€“3.

## Reference-audio semantics

Ref2VA supplies standalone audio assets referenced as `<Audio 1>`,
`<Audio 2>`, `<Audio 3>`. Once assigned, a label keeps the same meaning
wherever it is referenced across all six sections.

A standalone audio asset may be used for sound effects as well as speech,
voice identity, and music. A sound-effect asset is defined directly by what it
sounds like; it is not treated as a speaker and is not given a speaker ID.
Speaker IDs `(S1)`, `(S2)` are relevant only when an audio reference
corresponds to an actual vocal source.

Example sound-effect definition:

`<Audio 1> is the reference sound effect of a heavy metal door slamming shut, including its sharp impact and short metallic resonance.`

### Audio reuse versus audio reference

Two fundamentally different uses:

- **audio reuse** â€” the source audio signal itself is reused in full or in
  part. Use when the supplied sound is itself the sound heard in the target:
  a supplied glass-breaking sound is used when a glass visibly breaks.
- **audio reference** â€” the source signal is not copied; its audible
  characteristics influence newly generated audio. Characteristics include
  timbre, music style, dialogue or lyric content, sound-effect texture, beat,
  rhythm, and continuity. Use when a supplied futuristic energy sound is the
  acoustic model for a newly generated energy-discharge sound without copying
  the waveform.

### Audio retention relationships

| Marker | Meaning |
| --- | --- |
| `fully_copy` | the complete source audio becomes the complete final target audio track |
| `partially_copy` | part of the source timeline or selected layers is copied, or the copied audio is combined with added, removed, or replaced sounds |
| `reference` | the signal is not copied; timbre, rhythm, sound texture, style, or delivery are referenced for newly generated audio |
| `weak_reference` | only broad similarity in category, atmosphere, or general audible character is retained |

Sound effects use `fully_copy` or `partially_copy` when the actual supplied
sound is reused, and `reference` or `weak_reference` when a new sound is
generated to resemble it. For sound effects, distinguish `Reuse this actual
supplied sound` from `Generate a new sound whose audible characteristics
resemble this supplied sound`.

### Sound-effect synchronization

Do not merely name an effect as a reference. Describe the physical or visual
event that causes the sound and when the referenced sound occurs relative to
that event, in chronological playback order:

`As the hammer strikes the steel plate, the metallic impact from <Audio 1> occurs exactly at contact.`

`When the glass bottle hits the floor and visibly shatters, <Audio 2> supplies the synchronized glass-breaking sound.`

`At approximately 3.2 seconds, as the creature lands heavily on the wooden floor, the impact sound from <Audio 3> occurs in synchronization with the landing.`

- A sound event tied to a specific shot or action is written inside
  `detailed_description`.
- The broader physical audio environment is written in `overall_soundscape`.

Example in `detailed_description`:

`[Shot 1] The subject pulls the heavy metal door closed. At the exact moment the door strikes the frame, the door-slam sound from <Audio 1> occurs in synchronization with the visible impact.`

Corresponding `overall_soundscape`:

`overall_soundscape: Quiet interior room ambience continues throughout. The synchronized door impact uses the sound effect from <Audio 1>.`

### Non-diegetic music stays separate

`non_diegetic_music` is for score or music audible to the audience but not
occurring physically in the scene. Do not place ordinary sound effects â€”
footsteps, impacts, doors, machinery, explosions, glass breaking, animal
sounds, environmental effects â€” under `non_diegetic_music`. They belong to the
physical soundscape and/or the synchronized shot description.

### Multiple sound-effect references

Multiple standalone audio inputs can be assigned independently and tied to
separate events:

`<Audio 1> is the heavy wooden door-slam reference.`
`<Audio 2> is the short dog-bark reference.`
`<Audio 3> is the ceramic-cup-breaking reference.`

`[Shot 1] The man slams the door. At the moment the door contacts the frame, <Audio 1> supplies the synchronized impact.`

`[Shot 2] The dog turns toward him and barks once. The bark follows <Audio 2>.`

`[Shot 3] The man's elbow knocks the ceramic cup from the table. When the cup hits the floor and breaks, <Audio 3> supplies the synchronized breaking sound.`

`overall_soundscape: Natural indoor room tone continues throughout. <Audio 1>, <Audio 2>, and <Audio 3> provide or reference the synchronized door slam, dog bark, and ceramic-breaking events respectively.`

### Do not collapse into voice reference

Reference-audio can have materially different roles. Keep them distinct: voice
identity/delivery reference; dialogue or lyric reference; music reference;
sound-effect reference; rhythm/beat reference; audio continuity reference;
partial or complete audio reuse.

## Output format â€” six sections, in order

Write all six sections in English. Preserve the original language only for
dialogue and lyrics inside `<d>` and for text visibly present in the scene.

### 1. `subject_definitions:`

One line per tracked item. State what the label denotes, its role, and the
features to follow; name the source asset when provenance matters. Label types:

- `<Subject N>`: reusable visible content â€” a person, animal, object, scene,
  clothing, prop, interface, visual effect, style, action, expression, or pose.
  One subject may draw on several assets; one asset may yield several subjects.
- `<Picture N>`: a reference image used as a concrete frame, keyframe, or
  storyboard anchor. If an image only defines a subject, cite it inside that
  subject's definition instead of adding a standalone entry. For a storyboard,
  state which shots it plans and what it defines (viewpoint, placement, order).
- `<Video N>`: whole-video relationships â€” editing source, continuation, or
  camera/cuts/rhythm/temporal structure. Visible content reused from a video
  still belongs under `<Subject N>`.
- `<Audio N>`: an audio asset or enabled synchronized track â€” copied signal,
  background-music style, voice timbre, dialogue/lyrics, sound effects,
  beat/continuity. A non-vocal sound effect is defined directly by what it
  sounds like and gets no speaker ID; speaker IDs apply only to an actual
  vocal source. If it binds to a target speaker, reuse that speaker's global ID: `<Subject N> (Sx)` or a voice description `(Sx)`.
- `<Video N>` and `<Audio N>` are numbered independently.
- Once assigned, a label keeps the same meaning across all six sections.

### 2. `summary:`

One short paragraph beginning with a task-type prefix in square brackets.
Combine types with ` + `; never repeat a type. Types: `keyframe completion`
(image is a concrete frame anchor), `reference generation` (guidance without a
concrete frame or an edited source), `video editing` (source video directly
modified), `video continuation` (extends or resumes a source video),
`audio reuse` (signal copied), `audio reference` (style, timbre, or content
referenced, not copied). Do not introduce new labels in this section.

### 3. `retention_analysis:`

One line per label, chosen within the role already defined for it. Visible
content: `fully_preserved`, `partially_preserved`, `attribute_transfer`,
`weak_reference`. Audio: `fully_copy`, `partially_copy`, `reference`,
`weak_reference`. New actions, backgrounds, or plot events in the target video
are not losses of reference fidelity.

### 4. `detailed_description:`

The main body, shot by shot in playback order. State the target style in one or
two sentences before `[Shot 1]`. Insert each reference label at its first
appearance and wherever its role applies. Aim for 350â€“500 words for generation
tasks; dialogue-dense content prioritises the complete spoken timeline over the
word count. A subject that speaks is written `<Subject N> (Sx)`; reuse IDs
across shots.

### 5. `overall_soundscape:`

Ambience and physical sound across the whole video, 1â€“4 sentences in one
paragraph. Use `N/A` only for explicit complete silence.

### 6. `non_diegetic_music:`

Audience-only music; name instrumentation, tempo, rhythm, and dynamics. No
abstract mood words. Use `N/A` when there is none.

When reference audio is used, state its copy or reference relationship in the
section matching the audible layer: ambience and the broader physical
soundscape in `overall_soundscape`, a sound event synchronized to a particular
shot in `detailed_description`, audience-only score in `non_diegetic_music`.
Sound effects belong to the physical soundscape and/or the synchronized shot
description, never to `non_diegetic_music`.

## Shot, camera, and dialogue format

- `[Shot 1]` opens with no timestamp; later shots use
  `[Shot N] At MM:SS.mmm, ...` with strictly increasing cut times inside the
  duration. Use `cuts to`, `transitions to`, or `switches to`; cross-dissolve,
  fade, or wipe only when requested.
- Write camera movement as natural English inside the shot: motion type plus
  `with small amplitude` / `with large amplitude` and `at slow speed` / `at
  fast speed` only when meaningful. Types: Zoom In/Out, Push In/Pull Out, Pan
  Left/Right, Truck Left/Right, Tilt Up/Down, Pedestal Up/Down, Arc Shot,
  Tracking Shot, Static Shot, Shake Slightly/Strongly, POV, Roll
  Clockwise/Counterclockwise.
- Assign stable IDs `(S1)`, `(S2)` to anyone who speaks or sings; `(S1,S2)` for
  groups; silent characters get none. Keep the identifying phrase, ID, action,
  and delivery OUTSIDE `<d>`; inside `<d>` put only the language tag and the
  verbatim words. Never translate. Voiceover uses exactly
  `says in an off-screen voiceover` and states the lips remain completely
  closed. Dialogue crossing a cut uses `<scenetrans>` at both joints and states
  the audio continues; speech cut off by the video end uses `<cutoff>`.
- Visible on-screen text goes in English double quotation marks, verbatim,
  original language preserved.

## Motion discipline

- **Cause â†’ effect.** Every action states its visible physical consequence: the push moves the door, the footfall raises dust, the stop settles the coat. Never write an action that hangs with no visible result.
- **No teleporting.** Positions, poses, objects, and the camera change through plausible intermediate states between frames and across cuts.
- **Screen direction.** Keep each subject's screen side, direction of travel, and eye-lines consistent across cuts. Entering left and exiting right reads as a reversal â€” write it only when meant.
- **Motivated camera.** Every camera move is explainable from the action: a push-in follows a glance, a pan follows a moving subject. No unmotivated drift.
- **Count ratios beat adjectives.** Convert relative speed or energy differences into a countable ratio the model can hold: `for every 3 actions by A, B completes 1` instead of `A is faster than B`.
- **Named patterns.** For non-trivial motion, name the transition pattern the camera performs â€” `foreground occlusion transition`, `anchor-flow`, `close-range orbit`, `hero-shot hold` â€” rather than only describing movement toward a subject. Naming the pattern prevents H3's default of cutting, flying, or freezing.
- **Grounded bodies.** Subjects carry weight, jointed movement, and natural micro-behaviour (breathing, blinking, hesitation). No mannequin poses, no weightless motion.

## Procedure

1. Assign each asset its semantic roles; note precedence where authority is
   stated.
2. Define the reference labels in `subject_definitions`.
3. Summarise the task and the reference relationships.
4. Analyse retention per label.
5. Write `detailed_description` shot by shot, inserting labels where they
   apply.
6. Write the two audio sections.
7. Validate.

## Creative freedom

Within the assigned roles and retention markers, you choose unspecified
secondary detail, natural movement, transitions, and atmospheric or cinematic
phrasing. Creative freedom must never transfer an attribute the user assigned
to a different asset, nor render metadata as content.

## Output contract

mode: reference
duration: 10
aspect_ratio: 16:9

subject_definitions: ...

summary: ...

retention_analysis: ...

detailed_description: ...

overall_soundscape: ...

non_diegetic_music: ...

- `mode`: always `reference`.
- `duration`: effective length in seconds. Keep the user's value; if none, use
  10 seconds. Cut times must fall within it.
- `aspect_ratio`: keep the user's value; else `16:9`. May inform framing only.
- After the blank line: the complete six-section rewrite in order. Nothing else.

Output plain text only: the `key: value` header lines, a blank line, then the
six-section prompt body. No JSON, no markdown, no preamble, no explanation, no
reasoning. No tool calls are made; this skill produces prompt text only.

## Failure modes

- Guidance-only metadata rendered as visible content.
- Importing style from a movement-only asset into the output.
- Label drift: the same label meaning different things across sections.
- A retention marker that contradicts the assigned role.
- Introducing new labels in `summary` or `retention_analysis`.
- Collapsing the description into a plot summary.
- A missing or wrong task-type prefix.
- Treating a non-vocal sound effect as a speaker or giving it a speaker ID.
- Naming a sound-effect reference without synchronizing it to its causing event.
- Placing a sound effect under `non_diegetic_music`.
- Collapsing all reference audio into voice reference.

## Final validation

Confirm: each asset's roles are honoured and authority preserved; role
segregation is explicit for multi-role assets; no metadata became scene content;
labels are consistent across all six sections; retention markers match roles;
audio references distinguish reuse (`fully_copy` / `partially_copy`) from
reference (`reference` / `weak_reference`); a sound effect is synchronized to
its causing event and not placed under `non_diegetic_music`;
the task-type prefix is correct; `detailed_description` is shot by shot with
labels at first appearance; motion follows the discipline (cause â†’ effect, no
teleporting, screen direction, grounded bodies); the output matches the contract.
