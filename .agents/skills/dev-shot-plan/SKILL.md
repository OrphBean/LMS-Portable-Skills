# dev-shot-plan

Use as the final pre-prompt output: assemble a developed concept into a full shot-by-shot coverage plan. Hand it to `h3-director`, which routes it to a modality skill. Do NOT write the H3 prompt here (that is h3-director / the modality skills), and do NOT choose a genre here (genre-orchestrator).

---

## Reasoning mode

`instruct` — the plan follows an explicit assembly procedure. Escalate to `low`/`medium` only for genuinely complex biomechanical coverage; never default to heavy thinking on a simple sequence.

## Inputs

- A concept from `dev-director`: characters, environment, interactions, style.
- Optional genre (via `genre-orchestrator`) and optional duration / aspect ratio.

## The screenwriter's frame (mandatory discipline)

Write like a screenwriter who can only see the frame:

- **Only what is in the frame.** Describe visible/audible events. Off-screen only if explicitly stated; no metadata as content.
- **Nouns and verbs.** Concrete subjects doing concrete actions, in order. Never a mood jumble.
- **Cause and effect.** Every action states its visible consequence: a push moves the door, a footfall raises dust, a stop settles the coat.
- **Motion continuity.** Events are temporally legible: what happens, in what order, how it develops, how the shot concludes. No teleporting.
- **Screen direction.** Keep screen sides, travel direction, and eyelines consistent across cuts; entering left / exiting right is a reversal, write it only when meant.
- **Real human subjects.** Weight, posture, anatomical plausibility, natural micro-behaviour. Never a mannequin or AI gloss.

Abstract mood may supplement observable action, never replace it.

## Assembly procedure

1. Establish **characters** (identity, appearance, relation) and **environment** (setting, props, motif, palette).
2. Define **interactions** as a causal beat chain — the sequence of observable events with consequences.
3. If a genre/style is active (via `genre-orchestrator`), fold its style reference into the overall **style** and any per-shot axes; never let it override a user fact.
4. Decide **single shot or multi-shot** from the duration and the beats: one continuous causal chain for a short clip; coverage for a fuller sequence.
5. For each beat assign one shot with the grammar fields below.
6. Apply **continuity** across every cut.

## Output contract (plain text, headed fields)

```
characters: ...
environment: ...
interactions: ...
style: ...
sequence:
  [Shot 1]
    frame: <size> / <angle> / <height>
    move: <move and why>
    composition: <elements guiding the eye>
    staging: <blocking + performance + physicality>
    lighting: <quality + direction + source + colour>
    audio: <diegetic/ambient>
    continuity: <axis / screen direction / phase on entry>
    cut: <how it hands to the next shot>
  [Shot 2] ...
```

- Semantic, cinematic language — not H3 syntax. The modality skill maps these terms to H3 shot/cut and camera wording.
- Every shot must state entry and settled end state; the end of one is the start of the next (world state preserved: which foot, which hand, which way facing, which contact).
- 1–N shots; match the count and pace to the duration. Do not force a shot list when one continuous take is right.

## Per-shot attribute semantics

- `frame` — shot size for the beat's job, angle for power/relation, height to the subject's eye level.
- `move` — one principal camera move, with direction, amplitude, speed and its motivation.
- `composition` — the elements (thirds, leading lines, frame-in-frame, layering, space, tone) that guide the eye.
- `staging` — blocking in depth/diagonal, the dominant figure, and the actors' weight and micro-behaviour.
- `lighting` — the four choices (quality/direction/source/colour) and high/low-key.
- `audio` — the sound that accompanies the physical event (synchronised to contact).
- `continuity` — the action axis, screen direction, and the inherited phase of any unfinished action.
- `cut` — how the shot hands on: a cut for new information, or camera motion instead.

## Decision rules

- Priority: user facts > reference preservation > genre > cinematic convention > creative embellishment.
- If the user leaves a choice open, make one concrete consistent decision and note it.
- Prefer a continuous causal chain over disconnected actions; keep one principal camera move per shot.
- Preserve exact state variables (weight-bearing foot, grips, facing, contact, open/closed) across shots.

## Final validation

Before output, confirm: every action is a causal chain with a settled end state; nothing off-screen unless stated; screen direction and the action axis hold across cuts; each shot has one motivated principal move; camera is specified independently of subject motion; audio syncs to its causing event; real-human physicality is present; the plan is semantic (no H3 `[Shot]` syntax, no H3 camera verb list).

## Failure modes

- Producing the H3 prompt instead of a semantic plan (double-writes the modality stage).
- A mood jumble with no visible subjects/actions/consequences.
- Silently resetting a world state (contradicting which foot/hand/facing/contact).
- Screen direction or axis flipping across a cut without the subject turning.
- A shot list that overflows the duration, or a force-split of what should be one take.
- Genre overrriding a user fact.
