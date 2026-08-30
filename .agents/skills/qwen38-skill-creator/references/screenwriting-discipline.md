# The screenwriter's frame

The discipline every compiled visual-generation skill inherits. Write like a
screenwriter who can only see the frame: concrete, physical, cause-and-effect
visual language. This file is DESIGN-time reference for the compiler; the
compiled skill carries only the operational rules it needs.

## Only what is in the frame

- Describe visible and audible events only. Nothing off-screen unless the user
  explicitly frames it as off-screen narration.
- No stage directions to the viewer, no instructions to the generation model,
  no metadata rendered as content.
- For a reference or storyboard, annotation (arrows, labels, masks, drawn
  paths) is information that shapes behaviour; it must never appear in the
  scene unless the user asks for it.

## Nouns and verbs, not mood

Abstract feeling is the reader's job; the prompt states the physical events
that produce it. Write concrete subjects doing concrete actions.

- Prefer: `She slides the unused coffee cup to the table's edge.`
- Over: `A mood of quiet loneliness settles over the kitchen.`

Mood words may supplement observable action but never replace it. A prompt
with no verb that names an action is a description of a poster, not a scene.

## Concrete cause and effect

Every action has a visible consequence, and the effect follows its cause in
time. Write the chain, not the action alone.

- A footfall raises dust.
- A push sets an object moving; the object keeps its momentum.
- A head turn drags the hair a beat behind.
- Releasing a held object starts its fall; landing compresses, then the body
  absorbs the impact.
- A door closes and the light it admitted disappears.

Physical causality includes the subject's own body: a stop follows a run, a
settle follows a stop, weight transfers before a reach. Do not write actions
that hang with no physical result.

## Motion logic and continuity

Events must be temporally legible: what happens, in what order, how movement
develops, how the shot concludes.

- No teleporting between frames or cuts. Positions, poses, objects, and camera
  change through plausible intermediate states.
- Matching action: an action that begins in one shot continues from the same
  point in the next shot, not from a new starting pose.
- A short duration holds a short chain of events. Do not overload a 5-second
  clip with a 30-second sequence; simplify or prioritise.
- Camera behaviour is part of the motion: what the camera does, and why the
  move is motivated (a push-in follows a glance, a pan follows a moving
  subject).

## Screen direction

The 180-degree axis is a continuity contract between shots and cuts.

- Keep each character on a consistent screen side across cuts.
- Direction of travel stays consistent: a subject moving screen-left in one
  shot keeps moving screen-left in the next.
- Eye-lines match: if one character looks right in a shot, the reverse shot
  positions the other character looking left.
- Entering left and exiting right reads as a reversal — write it only when you
  mean a turn-around.
- New scenes and new axes reset the contract; state it if it matters.

## Real human subjects, photographed

Generative models drift toward mannequin bodies and AI gloss. Compile skills
to anchor human subjects in photographic reality.

- **Anatomical accuracy.** Correct joint direction, natural ranges of motion,
  believable proportions, proper limb counts. A weight shift precedes a step; a
  reach extends the whole arm, not a teleporting hand.
- **Weight and posture.** Bodies have mass, a center of gravity, and posture
  that reflects strain, fatigue, or confidence. No weightless marionettes.
- **Natural micro-behaviour.** Breathing, blinking, hesitation, small
  adjustments, the catch before a decision, the settle after movement.
- **Imperfection as realism.** Flyaway hairs, skin texture, creased fabric,
  sweat, asymmetry, slight motion blur. These are realism cues, not defects.
- **Candid not cosmetic.** One clear action, believable light, honest posture.
  Do not polish everything into a studio gloss.

## Visceral visual poetry

Concrete physical detail, chosen precisely, carries feeling better than an
adjective. This is the "visceral visual poetry" target: imagery that is exact,
sensory, and physical, so the feeling arrives from what the words show, not
from what they name.

- Prefer: `He keeps his hand flat on the table until the tremble stops, then
  lifts it away.`
- Over: `A tense, emotional moment between them.`

## Compiling this into a skill

Turn the discipline into operational rules in the compiled skill:

- **Hard requirements:** only-in-frame rule; nouns-and-verbs rule; every action
  states its visible consequence; screen-direction constancy; no abstract mood
  replacing action; human subjects carry weight, anatomy, and micro-behaviour.
- **Failure modes:** abstract-mood prose; off-frame content; teleporting
  between frames/cuts; screen-side flips; weightless or anatomically
  implausible bodies; action with no consequence.
- **Final validation:** a short self-check naming the highest-risk of these for
  the specific skill (a video skill checks continuity and screen direction; a
  still-photograph skill checks anatomy, weight, and light).
