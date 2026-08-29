# Example good Qwen skill

A complete, compact example of what a compiled Qwen runtime skill looks like
under the screenwriter's frame. Same domain as `example-bad-qwen-skill.md`;
compare the two. This is a reference example for the compiler, not a template
to imitate wholesale.

---

# h3-short-motion-prompt

Turn a request for a person doing a short physical action into a MiniMax H3
motion prompt written in the screenwriter's frame.

## Reasoning mode

`instruct`

## When to use

Use when a user describes a short real-world action by a human subject (cross a
room, pick up a cup, lean over a counter) and wants a video prompt. Do NOT use
for static image prompts, for scenes without a clear physical action, or for
prompts that need biomechanical decomposition of a complex action sequence.

## Inputs / semantic interpretation

- `user_request`: the sole authority for subject, action, setting, and duration.
- Keyframe (optional): literal frame source; motion develops forward from it.

## Hard requirements

- Describe only visible events inside the frame; nouns and verbs. No abstract
  mood words — translate mood into physical behaviour.
- Every action states its visible consequence (cause → effect): the push
  moves the door, the reach drags the sleeve, the stop settles the coat.
- Motion continuity: events are ordered, no teleporting; positions, poses, and
  camera change plausibly.
- Screen direction: the subject's screen side and direction of travel stay
  consistent across cuts.
- The human body is grounded: weight shifts, jointed movement, natural
  micro-behaviour, small imperfections. No mannequin poses, no weightless
  motion.
- Fit the sequence to the duration; never overload a short clip.

## Procedure

1. Read the request and any keyframe.
2. Write the subject's action as a cause-and-effect chain (start → main action
   → visible consequence / follow-through).
3. Add the environment response that the action produces.
4. Choose camera behaviour that is motivated by the action.
5. Compose one coherent paragraph in the screenwriter's frame.

## Decision rules

- A single clear action is the core; secondary detail is optional.
- If the action is complex enough to need staging (a fall, a lift, a climb),
  use `thinking` mode instead of `instruct` — flag it in the header.
- If a keyframe defines a required first or last frame, this is not t2v; route
  to the boundary-frame skill.

## Creative freedom

You choose micro-behaviour, environment response, and cinematic phrasing within
the user's facts, the action, the screen-direction contract, and the duration.
You may not drop the visible consequence of an action.

## Output contract

A single plain-text paragraph: the H3 prompt. No markdown, no JSON, no
explanatory preamble. Example (for "a woman crosses the kitchen to switch off
the radio"):

```
The woman sets down the glass, its contents settling. She walks the length of
the kitchen, screen-left to screen-right, her stride unhurried, the hem of her
shirt swaying a beat behind her. She reaches the counter, leans forward with
her weight on the counter edge, and presses the radio off; the dial clicks and
the sound drops out, leaving the room quieter. She stays a moment, hand still
on the radio, breathing.
```

## Failure modes

- Mood prose with no physical action ("an uneasy silence fills the room").
- Off-frame narration (what the camera cannot see).
- Teleporting between frames or a screen-side flip across a cut.
- An action with no consequence (presses the radio off, nothing changes).
- A weightless or anatomically impossible body.

## Final validation

Before finishing, confirm: every sentence shows something visible; the cause of
each effect is in the frame; the sequence is ordered and fits the duration; the
screen side and travel direction are constant; the body reads as weighted and
real; no mood word replaced an action.
