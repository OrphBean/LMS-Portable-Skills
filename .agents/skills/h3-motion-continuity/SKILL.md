---
name: h3-motion-continuity
description: Physically grounded motion and continuity methodology for H3 video prompts. Use when writing H3 prompts where body mechanics, causal action chains, weight transfer, locomotion, spatial continuity, or match-on-action across cuts matter. Governs how to describe subject motion, physical interaction, world-state persistence, and camera trajectory. Do NOT use for camera-style/look references (use h3-style-*), or for narrative, genre, or dialogue decisions.
---

# H3 motion & continuity overlay

## Purpose

Authoritative methodology for writing physically plausible, causally connected
motion in H3 prompts: body mechanics, spatial continuity within a shot,
continuity across cuts, and independent camera trajectory. Load this skill when
the scene involves people or objects moving, interacting, or cutting between
angles. It never changes the modality (t2v / i2v / first-last / last-frame /
reference) and never overrides user facts.

## Reasoning mode

`instruct` — deterministic physical-language rules applied within the active
H3 modality skill's procedure. Complex biomechanical decomposition stays the
base skill's concern, not this overlay's.

## How it layers

- Run the normal H3 workflow and choose the modality as usual.
- This overlay governs how action, movement, interaction, cuts, and their
  sounds are written inside `integrated_multimodal_description` and
  `overall_soundscape`. It does not supply look or colour language.
- User-specified scene facts win; the overlay supplies the physical motion
  language and continuity rules only.
- For short clips prefer one continuous causal action chain over several
  independent actions; keep one principal camera operation per shot.

## Motion principles

### Physically continuous action

Build every shot as a physically continuous sequence of observable states, not
a list of disconnected actions. Establish the subject's starting position,
orientation, gaze, body support, object relationships, and screen direction
before motion begins. Describe each action as:

`START STATE → PREPARATION → WEIGHT OR FORCE TRANSFER → PRIMARY MOTION → CONTACT OR ARRIVAL → SETTLED END STATE`

The end state of one action becomes the explicit start state of the next.
Natural body movement follows arcs, uses anticipation before forceful actions,
accelerates and decelerates rather than moving at constant speed, and includes
appropriate follow-through and overlapping motion in the limbs, clothing, hair,
and carried objects.

### Locomotion and support mechanics

Specify support mechanics and trajectory through the environment:

- Stepping: "She shifts her weight onto her left leg, lifts her right foot,
  steps forward and slightly to camera right, plants the right foot firmly,
  transfers her body weight onto it, then brings the left leg through into the
  next step."
- Turning: "He first turns his head toward the doorway, his shoulders follow,
  then his pelvis and planted feet rotate until his whole body faces the
  doorway."
- Reaching: "She looks toward the cup, rotates her torso slightly toward it,
  extends her right arm from the shoulder, bends the elbow as the hand
  approaches, opens her fingers, closes them around the handle, then lifts the
  cup while maintaining the grip."
- Sitting: "He backs toward the chair until his calves approach the seat, shifts
  his hips rearward, bends both knees, lowers his center of mass under control,
  makes contact with the seat, then settles his weight fully onto the chair."

These encode causality and mechanically plausible intermediate states rather
than asking the model to interpolate between unrelated poses. Explicit
trajectories, waypoints, speed, and whole-body coordination are established
control concepts in character-motion research.

### Scene geography within a shot

Preserve scene geography. State whether the subject moves camera-left to
camera-right, toward or away from camera, diagonally across the room, or around
a specific object. Once a direction is established, maintain it unless the
subject visibly turns around. Keep important objects in stable spatial
relationships: "The table remains on her right," "the doorway remains ahead and
to camera left," "the second person remains opposite her." Do not replace
spatial descriptions with vague phrases such as "moves around naturally."

### Continuity across cuts

Preserve the axis of action, screen direction, eyelines, body state, object
possession, and unfinished movement. If a character exits Shot 1 moving
left-to-right, Shot 2 should normally continue the same apparent direction. If
she looks toward an object before the cut, the next shot should place that
object where her established eyeline implies. If cutting during an action,
Shot 2 begins from the same physical phase of that action rather than
restarting it.

Use cuts only when they introduce materially new visual information. Before
each cut, establish the outgoing state; after the cut, explicitly inherit it.
Example: "[Shot 1] The man walks from camera left toward the closed door at
camera right. He reaches it, plants his left foot beside the threshold, grips
the handle with his right hand and begins pulling it toward himself. [Shot 2]
At 00:04.000, cut to a closer angle from the same side of the action axis. His
right hand is already gripping the same handle and continues the pull begun in
Shot 1; the door swings toward him while his body remains behind it."
Maintaining the same side of the action axis preserves left/right relationships
and motion direction across the edit.

### Transitional verb language

Prefer explicit transitional verbs: shifts, plants, transfers, pivots, rotates,
leans, bends, extends, retracts, reaches, grips, releases, lowers, raises,
pushes, pulls, steps, crosses, passes behind, emerges, approaches, makes
contact, recoils, settles. Connect them causally with "as," "then," "after,"
"once," "while maintaining," and "without releasing."

Avoid simultaneous-action bundles such as "she turns, walks, grabs the bag and
sits down." Instead write: "She turns her head toward the bag; her shoulders and
torso follow. Once she faces it, she takes two steps toward the chair. She stops
beside the chair, reaches down with her right hand and grips the bag handle.
Keeping the bag in her hand, she turns toward the seat, bends her knees and
lowers herself onto the chair."

### Two-person force interaction

Identify who supplies the force and who responds to it. Example: "Person A
places their right hand against Person B's left shoulder and pushes steadily
toward camera right. Person B's shoulder moves first from the contact force;
their torso follows, their hips shift to recover balance, and their right foot
steps sideways to support the displaced weight."

For passive or relaxed motion: "Person B does not initiate movement. Their body
remains loose and only changes position in response to Person A's applied force;
the head, arms, and loose clothing lag slightly behind the torso and settle
afterward."

### World-state preservation

Preserve exact state variables that matter: which foot bears weight, which hand
holds each object, which way the torso faces, where the subject is relative to
landmarks, whether an object is open or closed, whether the character is
standing, crouching, seated, airborne, or in contact with another surface. Do
not allow a later sentence to silently reset those variables. Maintain a
continuously updated world state throughout the prompt.

### Camera trajectory independence

The camera has its own independent trajectory. Describe subject motion and
camera motion separately. "The woman walks steadily from left to right across
the room. The camera tracks alongside her at matching speed, maintaining a
medium profile framing." Do not say merely "the camera follows her dynamically."
Use one principal camera operation per shot and specify direction, amplitude,
speed, and framing retention.

## Soundscape

Synchronize contact sounds to the physical event that causes them: a footstep
sounds when the foot plants, fabric shifts during body rotation, a chair creaks
when weight transfers onto it, an object impacts when surfaces make contact.
Ambient sound remains spatially and temporally continuous across cuts unless
the location changes.

## Decision rules

- The overlay governs motion and continuity language only; never invent facts
  the user did not provide.
- For short H3 clips prefer one continuous causal action chain and one
  principal camera move per shot over multiple independent actions.
- Preserve user-stated screen directions, object positions, and phase of
  unfinished motion across cuts exactly.

## Creative freedom

You choose secondary detail, subject action, and scene content. The user's
facts and the H3 format always win; the overlay supplies the physical motion
language, continuity rules, and sound sync only.

## Failure modes

- Action lists with no mechanical glue (`she turns, walks, grabs the bag and
  sits down`).
- A silent world-state reset: a later sentence contradicts which foot bears
  weight, which hand holds an object, facing, or contact state established
  earlier.
- Screen direction or the action axis flipping across a cut without the subject
  turning around.
- An action restarted instead of continued after a cut (match-on-action broken).
- Describing a camera that "dynamically follows" without its own trajectory,
  direction, amplitude, speed, or framing retention.
- Unspecified spatial language ("moves around naturally") in place of scene
  geography.

## Final validation

Before output, confirm: every action is a causal chain with an explicit start
and settled end state; the world state (weight, grips, facing, contact) stays
consistent across the whole prompt; cuts inherit the outgoing phase of the
action and keep the axis of action and screen direction; camera motion is
specified independently of subject motion; contact sounds match the events that
cause them.
